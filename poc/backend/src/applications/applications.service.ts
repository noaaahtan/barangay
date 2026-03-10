import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { ApplicationsRepository } from "./applications.repository";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuditAction } from "../audit-logs/entities/audit-log.entity";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { ApplicationsQueryDto } from "./dto/applications-query.dto";
import { Application } from "./entities/application.entity";
import { ApplicationStatus } from "../common/constants";

// Status transition rules
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.SUBMITTED]: [
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.READY_FOR_PICKUP,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.APPROVED]: [
    ApplicationStatus.READY_FOR_PICKUP,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.REJECTED]: [ApplicationStatus.CANCELLED],
  [ApplicationStatus.READY_FOR_PICKUP]: [
    ApplicationStatus.COMPLETED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.COMPLETED]: [],
  [ApplicationStatus.CANCELLED]: [],
};

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly applicationsRepo: ApplicationsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query: ApplicationsQueryDto, userId: string, userRole: string) {
    const { page = 1, limit = 20, search, status, type } = query;
    this.logger.log(
      `findAll page=${page} limit=${limit} role=${userRole} userId=${userId}`,
    );

    // Citizens can only see their own applications
    const filterUserId = userRole === "CITIZEN" ? userId : undefined;

    const { applications, total } = await this.applicationsRepo.findAll({
      page,
      limit,
      search,
      status,
      type,
      userId: filterUserId,
    });

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<Application> {
    this.logger.log(`findOne id=${id} role=${userRole} userId=${userId}`);
    const application = await this.applicationsRepo.findById(id);
    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    // Citizens can only view their own applications
    if (userRole === "CITIZEN" && application.userId !== userId) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    return application;
  }

  async create(
    dto: CreateApplicationDto,
    userId: string,
  ): Promise<Application> {
    this.logger.log(`create userId=${userId} type=${dto.type}`);
    const referenceNumber = await this.generateReferenceNumber();

    const application = await this.applicationsRepo.create({
      ...dto,
      referenceNumber,
      userId,
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    // Audit log
    await this.auditLogsService.log(
      AuditAction.CREATE,
      "application",
      application.id,
      `${application.type} - ${application.referenceNumber}`,
      userId,
      undefined,
    );

    return application;
  }

  async updateStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
    userId: string,
    userRole: string,
  ): Promise<Application> {
    this.logger.log(
      `updateStatus id=${id} status=${dto.status} role=${userRole} userId=${userId}`,
    );
    // Only admin/staff can update status
    if (userRole === "CITIZEN") {
      throw new ForbiddenException(
        "You do not have permission to update application status",
      );
    }

    const application = await this.applicationsRepo.findById(id);
    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    // Validate status transition
    if (!this.isValidTransition(application.status, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${application.status} to ${dto.status}`,
      );
    }

    const oldStatus = application.status;
    application.status = dto.status;

    // Update timestamp fields based on new status
    if (
      dto.status === ApplicationStatus.APPROVED ||
      dto.status === ApplicationStatus.REJECTED
    ) {
      application.reviewedAt = new Date();
      application.reviewedBy = userId;
    }

    if (dto.status === ApplicationStatus.COMPLETED) {
      application.completedAt = new Date();
    }

    // Update notes if provided
    if (dto.notes) {
      application.notes = dto.notes;
    }

    const saved = await this.applicationsRepo.save(application);

    // Audit log
    await this.auditLogsService.log(
      AuditAction.UPDATE,
      "application",
      application.id,
      `${application.type} - ${application.referenceNumber}`,
      userId,
      `Status changed from ${oldStatus} to ${dto.status}`,
    );

    return saved;
  }

  async update(
    id: string,
    dto: UpdateApplicationDto,
    userId: string,
    userRole: string,
  ): Promise<Application> {
    this.logger.log(`update id=${id} role=${userRole} userId=${userId}`);
    // Only admin/staff can update details
    if (userRole === "CITIZEN") {
      throw new ForbiddenException(
        "You do not have permission to update application details",
      );
    }

    const application = await this.applicationsRepo.findById(id);
    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    Object.assign(application, dto);
    const saved = await this.applicationsRepo.save(application);

    // Audit log
    await this.auditLogsService.log(
      AuditAction.UPDATE,
      "application",
      application.id,
      `${application.type} - ${application.referenceNumber}`,
      userId,
      "Application details updated",
    );

    return saved;
  }

  async cancel(id: string, userId: string, userRole: string): Promise<void> {
    this.logger.log(`cancel id=${id} role=${userRole} userId=${userId}`);
    const application = await this.applicationsRepo.findById(id);
    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    // Citizens can only cancel their own applications
    if (userRole === "CITIZEN" && application.userId !== userId) {
      throw new ForbiddenException("You can only cancel your own applications");
    }

    // Cannot cancel if already cancelled
    if (application.status === ApplicationStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot cancel application with status ${application.status}`,
      );
    }

    application.status = ApplicationStatus.CANCELLED;
    await this.applicationsRepo.save(application);

    // Audit log
    await this.auditLogsService.log(
      AuditAction.DELETE,
      "application",
      application.id,
      `${application.type} - ${application.referenceNumber}`,
      userId,
      "Application cancelled",
    );
  }

  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.applicationsRepo.countByYear(year);
    const sequence = String(count + 1).padStart(6, "0");
    return `APP-${year}-${sequence}`;
  }

  private isValidTransition(
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ): boolean {
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
  }

  // Dashboard metrics
  async getMetrics() {
    this.logger.log("getMetrics");
    const [total, pendingReview, readyForPickup] = await Promise.all([
      this.applicationsRepo.countTotal(),
      this.applicationsRepo.countPendingReview(),
      this.applicationsRepo.countByStatus(ApplicationStatus.READY_FOR_PICKUP),
    ]);

    return {
      total,
      pendingReview,
      readyForPickup,
    };
  }

  async getRecent(limit: number = 5) {
    this.logger.log(`getRecent limit=${limit}`);
    return this.applicationsRepo.findRecent(limit);
  }
}
