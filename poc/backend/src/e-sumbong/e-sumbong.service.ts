import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { ReportsRepository } from "./reports.repository";
import { ReportResponsesRepository } from "./report-responses.repository";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuditAction } from "../audit-logs/entities/audit-log.entity";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportStatusDto } from "./dto/update-report-status.dto";
import { AddResponseDto } from "./dto/add-response.dto";
import { ResolveReportDto } from "./dto/resolve-report.dto";
import { ReportsQueryDto } from "./dto/reports-query.dto";
import { Report } from "./entities/report.entity";
import { ReportResponse } from "./entities/report-response.entity";
import { ReportStatus, UserRole } from "../common/constants";

// Valid status transitions
const VALID_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  [ReportStatus.SUBMITTED]: [ReportStatus.ACKNOWLEDGED, ReportStatus.DISMISSED],
  [ReportStatus.ACKNOWLEDGED]: [
    ReportStatus.INVESTIGATING,
    ReportStatus.RESOLVED,
    ReportStatus.DISMISSED,
  ],
  [ReportStatus.INVESTIGATING]: [ReportStatus.RESOLVED, ReportStatus.DISMISSED],
  [ReportStatus.RESOLVED]: [ReportStatus.CLOSED],
  [ReportStatus.CLOSED]: [],
  [ReportStatus.DISMISSED]: [],
};

@Injectable()
export class ESumbongService {
  private readonly logger = new Logger(ESumbongService.name);

  constructor(
    private readonly reportsRepo: ReportsRepository,
    private readonly responsesRepo: ReportResponsesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query: ReportsQueryDto, userId: string, userRole: string) {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      severity,
      startDate,
      endDate,
      bounds,
    } = query;

    this.logger.log(
      `findAll page=${page} limit=${limit} role=${userRole} userId=${userId}`,
    );

    // Citizens can only see their own reports
    const filterUserId = userRole === UserRole.CITIZEN ? userId : undefined;

    const { reports, total } = await this.reportsRepo.findAll({
      page,
      limit,
      status,
      type,
      severity,
      startDate,
      endDate,
      userId: filterUserId,
      bounds,
    });

    return {
      data: reports,
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
  ): Promise<{ report: Report; responses: ReportResponse[] }> {
    this.logger.log(`findOne id=${id} role=${userRole} userId=${userId}`);

    const report = await this.reportsRepo.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }

    // Citizens can only view their own reports (unless we add public reports later)
    if (userRole === UserRole.CITIZEN && report.userId !== userId) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }

    const responses = await this.responsesRepo.findByReportId(id);

    return { report, responses };
  }

  async create(dto: CreateReportDto, userId: string): Promise<Report> {
    this.logger.log(
      `create userId=${userId} type=${dto.type} severity=${dto.severity}`,
    );

    const referenceNumber = await this.generateReferenceNumber();

    const report = await this.reportsRepo.create({
      ...dto,
      referenceNumber,
      userId,
      status: ReportStatus.SUBMITTED,
      submittedAt: new Date(),
      photoUrls: dto.photoUrls || [],
      isAnonymous: dto.isAnonymous || false,
    });

    // Audit log
    await this.auditLogsService.log(
      AuditAction.CREATE,
      "report",
      report.id,
      `${report.type} - ${report.referenceNumber}`,
      userId,
      undefined,
    );

    return report;
  }

  async updateStatus(
    id: string,
    dto: UpdateReportStatusDto,
    userId: string,
    userRole: string,
  ): Promise<Report> {
    this.logger.log(
      `updateStatus id=${id} status=${dto.status} role=${userRole} userId=${userId}`,
    );

    // Only authorized roles can update status
    if (userRole === UserRole.CITIZEN) {
      throw new ForbiddenException(
        "You do not have permission to update report status",
      );
    }

    const report = await this.reportsRepo.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }

    // Validate status transition
    if (!this.isValidTransition(report.status, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${report.status} to ${dto.status}`,
      );
    }

    const oldStatus = report.status;
    report.status = dto.status;
    report.reviewedBy = userId;
    report.reviewedAt = new Date();

    const updated = await this.reportsRepo.save(report);

    // Audit log
    await this.auditLogsService.log(
      AuditAction.UPDATE,
      "report",
      report.id,
      `Status: ${oldStatus} → ${dto.status}${dto.notes ? ` (${dto.notes})` : ""}`,
      userId,
      undefined,
    );

    return updated;
  }

  async addResponse(
    reportId: string,
    dto: AddResponseDto,
    userId: string,
    userRole: string,
  ): Promise<ReportResponse> {
    this.logger.log(
      `addResponse reportId=${reportId} role=${userRole} userId=${userId}`,
    );

    // Only authorized roles can add responses
    if (userRole === UserRole.CITIZEN) {
      throw new ForbiddenException(
        "You do not have permission to add responses",
      );
    }

    const report = await this.reportsRepo.findById(reportId);
    if (!report) {
      throw new NotFoundException(`Report with id "${reportId}" not found`);
    }

    const response = await this.responsesRepo.create({
      reportId,
      responderId: userId,
      responseText: dto.responseText,
    });

    // Audit log
    await this.auditLogsService.log(
      AuditAction.CREATE,
      "report_response",
      response.id,
      `Response added to ${report.referenceNumber}`,
      userId,
      undefined,
    );

    return response;
  }

  async resolve(
    id: string,
    dto: ResolveReportDto,
    userId: string,
    userRole: string,
  ): Promise<Report> {
    this.logger.log(`resolve id=${id} role=${userRole} userId=${userId}`);

    // Only authorized roles can resolve reports
    if (userRole === UserRole.CITIZEN) {
      throw new ForbiddenException(
        "You do not have permission to resolve reports",
      );
    }

    const report = await this.reportsRepo.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }

    report.status = ReportStatus.RESOLVED;
    report.resolvedAt = new Date();
    report.resolutionDetails = dto.resolutionDetails;
    report.reviewedBy = userId;

    const updated = await this.reportsRepo.save(report);

    // Audit log
    await this.auditLogsService.log(
      AuditAction.UPDATE,
      "report",
      report.id,
      `Report resolved: ${dto.resolutionDetails.substring(0, 100)}`,
      userId,
      undefined,
    );

    return updated;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    this.logger.log(`delete id=${id} role=${userRole} userId=${userId}`);

    // Only admins can delete reports
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to delete reports",
      );
    }

    const report = await this.reportsRepo.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }

    await this.reportsRepo.remove(report);

    // Audit log
    await this.auditLogsService.log(
      AuditAction.DELETE,
      "report",
      id,
      `Deleted report ${report.referenceNumber}`,
      userId,
      undefined,
    );
  }

  async getAnalytics() {
    this.logger.log("getAnalytics");

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalReports, pendingReports, resolvedThisWeek, emergencyReports] =
      await Promise.all([
        this.reportsRepo.countByStatus([
          ReportStatus.SUBMITTED,
          ReportStatus.ACKNOWLEDGED,
          ReportStatus.INVESTIGATING,
          ReportStatus.RESOLVED,
          ReportStatus.CLOSED,
          ReportStatus.DISMISSED,
        ]),
        this.reportsRepo.countByStatus([
          ReportStatus.SUBMITTED,
          ReportStatus.ACKNOWLEDGED,
        ]),
        this.reportsRepo.countResolvedInDateRange(weekAgo, now),
        this.reportsRepo.countBySeverity("EMERGENCY" as any),
      ]);

    return {
      totalReports,
      pendingReports,
      resolvedThisWeek,
      emergencyReports,
    };
  }

  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.reportsRepo.countByYear(year);
    const sequence = (count + 1).toString().padStart(6, "0");
    return `RPT-${year}-${sequence}`;
  }

  private isValidTransition(from: ReportStatus, to: ReportStatus): boolean {
    // Admin can always dismiss
    if (to === ReportStatus.DISMISSED) {
      return true;
    }
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }
}
