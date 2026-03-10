import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./entities/report.entity";
import { ReportResponse } from "./entities/report-response.entity";
import { ReportsRepository } from "./reports.repository";
import { ReportResponsesRepository } from "./report-responses.repository";
import { ESumbongService } from "./e-sumbong.service";
import { ESumbongController } from "./e-sumbong.controller";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ReportResponse]),
    AuditLogsModule,
  ],
  controllers: [ESumbongController],
  providers: [ReportsRepository, ReportResponsesRepository, ESumbongService],
  exports: [ESumbongService],
})
export class ESumbongModule {}
