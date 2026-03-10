import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, In } from "typeorm";
import { Report } from "./entities/report.entity";
import { ReportStatus, ReportType, ReportSeverity } from "../common/constants";

export interface FindAllReportsOptions {
  page: number;
  limit: number;
  status?: string; // Comma-separated statuses
  type?: string; // Comma-separated types
  severity?: string; // Comma-separated severities
  startDate?: string;
  endDate?: string;
  userId?: string;
  bounds?: string; // minLat,minLng,maxLat,maxLng
}

export interface FindAllReportsResult {
  reports: Report[];
  total: number;
}

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repo: Repository<Report>,
  ) {}

  async findAll(options: FindAllReportsOptions): Promise<FindAllReportsResult> {
    const {
      page,
      limit,
      status,
      type,
      severity,
      startDate,
      endDate,
      userId,
      bounds,
    } = options;

    const qb = this.repo
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.user", "user")
      .leftJoinAndSelect("report.reviewer", "reviewer")
      .orderBy("report.submittedAt", "DESC");

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      qb.andWhere("report.status IN (:...statuses)", { statuses });
    }

    if (type) {
      const types = type.split(",").map((t) => t.trim());
      qb.andWhere("report.type IN (:...types)", { types });
    }

    if (severity) {
      const severities = severity.split(",").map((s) => s.trim());
      qb.andWhere("report.severity IN (:...severities)", { severities });
    }

    if (startDate) {
      qb.andWhere("report.submittedAt >= :startDate", { startDate });
    }

    if (endDate) {
      qb.andWhere("report.submittedAt <= :endDate", { endDate });
    }

    if (userId) {
      qb.andWhere("report.userId = :userId", { userId });
    }

    if (bounds) {
      const [minLat, minLng, maxLat, maxLng] = bounds.split(",").map(Number);
      qb.andWhere("report.latitude BETWEEN :minLat AND :maxLat", {
        minLat,
        maxLat,
      });
      qb.andWhere("report.longitude BETWEEN :minLng AND :maxLng", {
        minLng,
        maxLng,
      });
    }

    const total = await qb.getCount();
    const reports = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { reports, total };
  }

  async findById(id: string): Promise<Report | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "reviewer"],
    });
  }

  async findByReferenceNumber(referenceNumber: string): Promise<Report | null> {
    return this.repo.findOne({
      where: { referenceNumber },
      relations: ["user", "reviewer"],
    });
  }

  async countByYear(year: number): Promise<number> {
    return this.repo
      .createQueryBuilder("report")
      .where("EXTRACT(YEAR FROM report.submittedAt) = :year", { year })
      .getCount();
  }

  async countByStatus(statuses: ReportStatus[]): Promise<number> {
    return this.repo.count({
      where: { status: In(statuses) },
    });
  }

  async countBySeverity(severity: ReportSeverity): Promise<number> {
    return this.repo.count({
      where: { severity },
    });
  }

  async countResolvedInDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.repo.count({
      where: {
        status: ReportStatus.RESOLVED,
        resolvedAt: Between(startDate, endDate),
      },
    });
  }

  async create(data: Partial<Report>): Promise<Report> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async save(report: Report): Promise<Report> {
    return this.repo.save(report);
  }

  async remove(report: Report): Promise<void> {
    await this.repo.remove(report);
  }
}
