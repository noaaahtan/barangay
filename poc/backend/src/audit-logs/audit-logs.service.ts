import { Injectable, Logger } from "@nestjs/common";
import { AuditLogsRepository } from "./audit-logs.repository";
import { AuditLogsQueryDto } from "./dto/audit-logs-query.dto";
import { AuditAction } from "./entities/audit-log.entity";

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly auditLogsRepo: AuditLogsRepository) {}

  async log(
    action: AuditAction,
    entityType: string,
    entityId: string,
    entityName: string,
    userId: string,
    details?: string,
  ): Promise<void> {
    this.logger.log(
      `log action=${action} entity=${entityType} entityId=${entityId} userId=${userId}`,
    );
    await this.auditLogsRepo.create({
      action,
      entityType,
      entityId,
      entityName,
      userId,
      details,
    });
  }

  async findAll(query: AuditLogsQueryDto) {
    const { page, limit, entityType, search } = query;
    this.logger.log(
      `findAll page=${page} limit=${limit} entityType=${entityType ?? "all"}`,
    );
    const { logs, total } = await this.auditLogsRepo.findAll({
      page,
      limit,
      entityType,
      search,
    });

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
