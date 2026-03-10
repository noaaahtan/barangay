import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReportResponse } from "./entities/report-response.entity";

@Injectable()
export class ReportResponsesRepository {
  constructor(
    @InjectRepository(ReportResponse)
    private readonly repo: Repository<ReportResponse>,
  ) {}

  async findByReportId(reportId: string): Promise<ReportResponse[]> {
    return this.repo.find({
      where: { reportId },
      relations: ["responder"],
      order: { createdAt: "ASC" },
    });
  }

  async create(data: Partial<ReportResponse>): Promise<ReportResponse> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async save(response: ReportResponse): Promise<ReportResponse> {
    return this.repo.save(response);
  }

  async remove(response: ReportResponse): Promise<void> {
    await this.repo.remove(response);
  }
}
