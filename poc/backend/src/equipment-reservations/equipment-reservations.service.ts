import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuditAction } from "../audit-logs/entities/audit-log.entity";
import { EquipmentReservationStatus, EquipmentType } from "../common/constants";
import { EquipmentInventoryRepository } from "./equipment-inventory.repository";
import { EquipmentReservationsRepository } from "./equipment-reservations.repository";
import { CreateEquipmentReservationDto } from "./dto/create-equipment-reservation.dto";
import { UpdateEquipmentReservationDto } from "./dto/update-equipment-reservation.dto";
import { UpdateReservationStatusDto } from "./dto/update-reservation-status.dto";
import { EquipmentReservationsQueryDto } from "./dto/equipment-reservations-query.dto";
import {
  EquipmentReservation,
  EquipmentReservationItem,
} from "./entities/equipment-reservation.entity";

const VALID_TRANSITIONS: Record<
  EquipmentReservationStatus,
  EquipmentReservationStatus[]
> = {
  [EquipmentReservationStatus.SUBMITTED]: [
    EquipmentReservationStatus.FOR_DELIVERY,
    EquipmentReservationStatus.REJECTED,
    EquipmentReservationStatus.CANCELLED,
  ],
  [EquipmentReservationStatus.FOR_DELIVERY]: [
    EquipmentReservationStatus.COMPLETED,
    EquipmentReservationStatus.CANCELLED,
  ],
  [EquipmentReservationStatus.REJECTED]: [],
  [EquipmentReservationStatus.CANCELLED]: [],
  [EquipmentReservationStatus.COMPLETED]: [],
};

export interface AvailabilitySummary {
  type: EquipmentType;
  total: number;
  reserved: number;
  available: number;
}

@Injectable()
export class EquipmentReservationsService {
  private readonly logger = new Logger(EquipmentReservationsService.name);

  constructor(
    private readonly reservationsRepo: EquipmentReservationsRepository,
    private readonly inventoryRepo: EquipmentInventoryRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(
    query: EquipmentReservationsQueryDto,
    userId: string,
    userRole: string,
  ) {
    const { page = 1, limit = 20, search, status } = query;
    const isCitizen = userRole?.toLowerCase() === "citizen";
    this.logger.log(
      `findAll page=${page} limit=${limit} role=${userRole} userId=${userId}`,
    );

    const { reservations, total } = await this.reservationsRepo.findAll({
      page,
      limit,
      search,
      status,
      userId: isCitizen ? userId : undefined,
    });

    return {
      data: reservations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: string) {
    this.logger.log(`findOne id=${id} role=${userRole} userId=${userId}`);
    const reservation = await this.reservationsRepo.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with id "${id}" not found`);
    }

    if (
      userRole?.toLowerCase() === "citizen" &&
      reservation.userId !== userId
    ) {
      throw new NotFoundException(`Reservation with id "${id}" not found`);
    }

    return reservation;
  }

  async create(
    dto: CreateEquipmentReservationDto,
    userId: string,
  ): Promise<EquipmentReservation> {
    this.logger.log(`create userId=${userId} eventName=${dto.eventName}`);
    this.ensureValidDateRange(dto.startDate, dto.endDate);

    const availability = await this.getAvailability(dto.startDate, dto.endDate);
    this.assertAvailability(dto.requestedItems, availability);

    const referenceNumber = await this.generateReferenceNumber();

    const reservation = await this.reservationsRepo.create({
      referenceNumber,
      status: EquipmentReservationStatus.SUBMITTED,
      eventType: dto.eventType,
      eventName: dto.eventName,
      eventLocation: dto.eventLocation,
      startDate: dto.startDate,
      endDate: dto.endDate,
      requestedItems: dto.requestedItems,
      approvedItems: null,
      notes: null,
      userId,
    });

    await this.auditLogsService.log(
      AuditAction.CREATE,
      "equipment_reservation",
      reservation.id,
      reservation.referenceNumber,
      userId,
      `Created reservation for ${reservation.eventName}`,
    );

    return reservation;
  }

  async createBlock(
    dto: CreateEquipmentReservationDto,
    userId: string,
    userRole: string,
  ): Promise<EquipmentReservation> {
    this.logger.log(`createBlock userId=${userId} eventName=${dto.eventName}`);
    this.assertAdmin(userRole);
    this.ensureValidDateRange(dto.startDate, dto.endDate);

    const availability = await this.getAvailability(dto.startDate, dto.endDate);
    this.assertAvailability(dto.requestedItems, availability);

    const referenceNumber = await this.generateReferenceNumber();

    const reservation = await this.reservationsRepo.create({
      referenceNumber,
      status: EquipmentReservationStatus.FOR_DELIVERY,
      eventType: dto.eventType,
      eventName: dto.eventName,
      eventLocation: dto.eventLocation,
      startDate: dto.startDate,
      endDate: dto.endDate,
      requestedItems: dto.requestedItems,
      approvedItems: dto.requestedItems,
      notes: "Reserved by admin",
      userId,
      reviewedBy: userId,
      reviewedAt: new Date(),
    });

    await this.auditLogsService.log(
      AuditAction.CREATE,
      "equipment_reservation",
      reservation.id,
      reservation.referenceNumber,
      userId,
      `Admin reserved equipment for ${reservation.eventName}`,
    );

    return reservation;
  }

  async updateStatus(
    id: string,
    dto: UpdateReservationStatusDto,
    userId: string,
    userRole: string,
  ): Promise<EquipmentReservation> {
    this.logger.log(
      `updateStatus id=${id} status=${dto.status} role=${userRole} userId=${userId}`,
    );
    this.assertAdmin(userRole);

    const reservation = await this.reservationsRepo.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with id "${id}" not found`);
    }

    if (!this.isValidTransition(reservation.status, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${reservation.status} to ${dto.status}`,
      );
    }

    const oldStatus = reservation.status;
    reservation.status = dto.status;

    if (
      dto.status === EquipmentReservationStatus.FOR_DELIVERY ||
      dto.status === EquipmentReservationStatus.REJECTED
    ) {
      reservation.reviewedAt = new Date();
      reservation.reviewedBy = userId;
    }

    if (dto.status === EquipmentReservationStatus.COMPLETED) {
      reservation.fulfilledAt = new Date();
    }

    if (dto.approvedItems) {
      reservation.approvedItems = dto.approvedItems;
    }

    if (dto.notes) {
      reservation.notes = dto.notes;
    }

    const saved = await this.reservationsRepo.save(reservation);

    await this.auditLogsService.log(
      AuditAction.UPDATE,
      "equipment_reservation",
      reservation.id,
      reservation.referenceNumber,
      userId,
      `Status changed from ${oldStatus} to ${dto.status}`,
    );

    return saved;
  }

  async update(
    id: string,
    dto: UpdateEquipmentReservationDto,
    userId: string,
    userRole: string,
  ): Promise<EquipmentReservation> {
    this.logger.log(`update id=${id} role=${userRole} userId=${userId}`);
    this.assertAdmin(userRole);

    const reservation = await this.reservationsRepo.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with id "${id}" not found`);
    }

    if (dto.startDate || dto.endDate) {
      this.ensureValidDateRange(
        dto.startDate ?? reservation.startDate,
        dto.endDate ?? reservation.endDate,
      );
    }

    Object.assign(reservation, dto);
    const saved = await this.reservationsRepo.save(reservation);

    await this.auditLogsService.log(
      AuditAction.UPDATE,
      "equipment_reservation",
      reservation.id,
      reservation.referenceNumber,
      userId,
      "Updated reservation details",
    );

    return saved;
  }

  async cancel(id: string, userId: string, userRole: string): Promise<void> {
    this.logger.log(`cancel id=${id} role=${userRole} userId=${userId}`);
    const reservation = await this.reservationsRepo.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with id "${id}" not found`);
    }

    if (
      userRole?.toLowerCase() === "citizen" &&
      reservation.userId !== userId
    ) {
      throw new ForbiddenException("You can only cancel your own reservations");
    }

    const allowedStatuses = [
      EquipmentReservationStatus.SUBMITTED,
      EquipmentReservationStatus.FOR_DELIVERY,
    ];
    if (
      userRole?.toLowerCase() === "citizen" &&
      !allowedStatuses.includes(reservation.status)
    ) {
      throw new BadRequestException(
        `Cannot cancel reservation with status ${reservation.status}`,
      );
    }

    reservation.status = EquipmentReservationStatus.CANCELLED;
    await this.reservationsRepo.save(reservation);

    await this.auditLogsService.log(
      AuditAction.DELETE,
      "equipment_reservation",
      reservation.id,
      reservation.referenceNumber,
      userId,
      "Reservation cancelled",
    );
  }

  async getAvailability(
    startDate: string,
    endDate: string,
  ): Promise<AvailabilitySummary[]> {
    this.logger.log(
      `getAvailability startDate=${startDate} endDate=${endDate}`,
    );
    this.ensureValidDateRange(startDate, endDate);

    const inventory = await this.inventoryRepo.findAll({
      includeInactive: false,
    });
    const overlapping = await this.reservationsRepo.findOverlapping(
      startDate,
      endDate,
      [
        EquipmentReservationStatus.FOR_DELIVERY,
        EquipmentReservationStatus.COMPLETED,
      ],
    );

    const reservedMap = new Map<EquipmentType, number>();
    for (const reservation of overlapping) {
      const items = reservation.approvedItems ?? reservation.requestedItems;
      for (const item of items) {
        reservedMap.set(
          item.type,
          (reservedMap.get(item.type) ?? 0) + item.quantity,
        );
      }
    }

    return inventory.map((item) => {
      const reserved = reservedMap.get(item.type) ?? 0;
      const available = Math.max(item.quantityTotal - reserved, 0);
      return {
        type: item.type,
        total: item.quantityTotal,
        reserved,
        available,
      };
    });
  }

  async getMetrics() {
    this.logger.log("getMetrics");
    const total = await this.reservationsRepo.countTotal();
    const pending = await this.reservationsRepo.countByStatus(
      EquipmentReservationStatus.SUBMITTED,
    );
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const upcoming = await this.reservationsRepo.countUpcoming(now, nextWeek);

    return {
      total,
      pendingApproval: pending,
      upcomingThisWeek: upcoming,
    };
  }

  async getRecent(limit: number = 5) {
    this.logger.log(`getRecent limit=${limit}`);
    return this.reservationsRepo.findRecent(limit);
  }

  private assertAvailability(
    requestedItems: EquipmentReservationItem[],
    availability: AvailabilitySummary[],
  ) {
    const availabilityMap = new Map<EquipmentType, AvailabilitySummary>();
    for (const item of availability) {
      availabilityMap.set(item.type, item);
    }

    for (const request of requestedItems) {
      const available = availabilityMap.get(request.type)?.available ?? 0;
      if (request.quantity > available) {
        throw new BadRequestException(
          `Insufficient availability for ${request.type}. Requested ${request.quantity}, available ${available}.`,
        );
      }
    }
  }

  private ensureValidDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      throw new BadRequestException("Invalid date format");
    }
    if (end < start) {
      throw new BadRequestException("End date must be on or after start date");
    }
  }

  private isValidTransition(
    current: EquipmentReservationStatus,
    next: EquipmentReservationStatus,
  ): boolean {
    return VALID_TRANSITIONS[current]?.includes(next) ?? false;
  }

  private assertAdmin(userRole: string) {
    if (userRole?.toLowerCase() !== "admin") {
      throw new ForbiddenException("Admin access required");
    }
  }

  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.reservationsRepo.countByYear(year);
    const sequence = String(count + 1).padStart(6, "0");
    return `EQP-${year}-${sequence}`;
  }
}
