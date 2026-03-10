import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Application } from "./entities/application.entity";
import { ApplicationStatus, ApplicationType } from "../common/constants";

export interface FindAllApplicationsOptions {
  page: number;
  limit: number;
  search?: string;
  status?: ApplicationStatus;
  type?: ApplicationType;
  userId?: string; // For role-based filtering
}

export interface FindAllApplicationsResult {
  applications: Application[];
  total: number;
}

@Injectable()
export class ApplicationsRepository {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
  ) {}

  async findAll(
    options: FindAllApplicationsOptions,
  ): Promise<FindAllApplicationsResult> {
    const { page, limit, search, status, type, userId } = options;
    const qb = this.repo
      .createQueryBuilder("application")
      .leftJoinAndSelect("application.user", "user")
      .leftJoinAndSelect("application.reviewer", "reviewer")
      .orderBy("application.submittedAt", "DESC");

    if (search) {
      qb.andWhere(
        "(LOWER(application.referenceNumber) LIKE :search OR LOWER(application.applicantName) LIKE :search)",
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (status) {
      qb.andWhere("application.status = :status", { status });
    }

    if (type) {
      qb.andWhere("application.type = :type", { type });
    }

    if (userId) {
      qb.andWhere("application.userId = :userId", { userId });
    }

    const total = await qb.getCount();
    const applications = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { applications, total };
  }

  async findById(id: string): Promise<Application | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "reviewer"],
    });
  }

  async findByReferenceNumber(
    referenceNumber: string,
  ): Promise<Application | null> {
    return this.repo.findOne({
      where: { referenceNumber },
      relations: ["user", "reviewer"],
    });
  }

  async countByYear(year: number): Promise<number> {
    return this.repo
      .createQueryBuilder("application")
      .where("EXTRACT(YEAR FROM application.submittedAt) = :year", { year })
      .getCount();
  }

  async create(data: Partial<Application>): Promise<Application> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async save(application: Application): Promise<Application> {
    return this.repo.save(application);
  }

  async remove(application: Application): Promise<void> {
    await this.repo.remove(application);
  }

  async countTotal(): Promise<number> {
    return this.repo.count();
  }

  async countByStatus(status: ApplicationStatus): Promise<number> {
    return this.repo.count({ where: { status } });
  }

  async countPendingReview(): Promise<number> {
    return this.repo
      .createQueryBuilder("application")
      .where("application.status IN (:...statuses)", {
        statuses: [ApplicationStatus.SUBMITTED],
      })
      .getCount();
  }

  async findRecent(limit: number): Promise<Application[]> {
    return this.repo.find({
      order: { submittedAt: "DESC" },
      take: limit,
      relations: ["user", "reviewer"],
    });
  }
}
