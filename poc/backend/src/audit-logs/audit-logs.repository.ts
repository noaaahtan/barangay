import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

interface FindAllParams {
  page: number;
  limit: number;
  entityType?: string;
  search?: string;
}

interface CreateParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName: string;
  userId: string;
  details?: string;
}

@Injectable()
export class AuditLogsRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async findAll(params: FindAllParams): Promise<{ logs: AuditLog[]; total: number }> {
    const { page, limit, entityType, search } = params;
    const qb = this.repo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (entityType) {
      qb.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (search) {
      qb.andWhere('audit.entityName ILIKE :search', { search: `%${search}%` });
    }

    const total = await qb.getCount();
    const logs = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { logs, total };
  }

  async create(data: CreateParams): Promise<AuditLog> {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }
}
