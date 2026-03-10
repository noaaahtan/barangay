import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EquipmentReservation } from "./entities/equipment-reservation.entity";
import { EquipmentReservationStatus } from "../common/constants";

export interface FindAllEquipmentReservationsOptions {
  page: number;
  limit: number;
  status?: EquipmentReservationStatus;
  search?: string;
  userId?: string;
}

export interface FindAllEquipmentReservationsResult {
  reservations: EquipmentReservation[];
  total: number;
}

@Injectable()
export class EquipmentReservationsRepository {
  constructor(
    @InjectRepository(EquipmentReservation)
    private readonly repo: Repository<EquipmentReservation>,
  ) {}

  async findAll(
    options: FindAllEquipmentReservationsOptions,
  ): Promise<FindAllEquipmentReservationsResult> {
    const { page, limit, status, search, userId } = options;
    const qb = this.repo
      .createQueryBuilder("reservation")
      .leftJoinAndSelect("reservation.user", "user")
      .leftJoinAndSelect("reservation.reviewer", "reviewer")
      .orderBy("reservation.createdAt", "DESC");

    if (status) {
      qb.andWhere("reservation.status = :status", { status });
    }

    if (search) {
      qb.andWhere(
        "(LOWER(reservation.referenceNumber) LIKE :search OR LOWER(reservation.eventName) LIKE :search)",
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (userId) {
      qb.andWhere("reservation.userId = :userId", { userId });
    }

    const total = await qb.getCount();
    const reservations = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { reservations, total };
  }

  async findById(id: string): Promise<EquipmentReservation | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "reviewer"],
    });
  }

  async countByYear(year: number): Promise<number> {
    return this.repo
      .createQueryBuilder("reservation")
      .where("EXTRACT(YEAR FROM reservation.createdAt) = :year", { year })
      .getCount();
  }

  async findOverlapping(
    startDate: string,
    endDate: string,
    statuses: EquipmentReservationStatus[],
  ): Promise<EquipmentReservation[]> {
    return this.repo
      .createQueryBuilder("reservation")
      .where("reservation.startDate <= :endDate", { endDate })
      .andWhere("reservation.endDate >= :startDate", { startDate })
      .andWhere("reservation.status IN (:...statuses)", { statuses })
      .getMany();
  }

  async create(
    data: Partial<EquipmentReservation>,
  ): Promise<EquipmentReservation> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async save(reservation: EquipmentReservation): Promise<EquipmentReservation> {
    return this.repo.save(reservation);
  }

  async countTotal(): Promise<number> {
    return this.repo.count();
  }

  async countByStatus(status: EquipmentReservationStatus): Promise<number> {
    return this.repo.count({ where: { status } });
  }

  async countUpcoming(startDate: Date, endDate: Date): Promise<number> {
    return this.repo
      .createQueryBuilder("reservation")
      .where("reservation.status IN (:...statuses)", {
        statuses: [
          EquipmentReservationStatus.FOR_DELIVERY,
          EquipmentReservationStatus.COMPLETED,
        ],
      })
      .andWhere("reservation.startDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getCount();
  }

  async findRecent(limit: number): Promise<EquipmentReservation[]> {
    return this.repo.find({
      order: { createdAt: "DESC" },
      take: limit,
      relations: ["user", "reviewer"],
    });
  }
}
