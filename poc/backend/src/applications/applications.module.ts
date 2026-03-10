import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./entities/application.entity";
import { ApplicationsRepository } from "./applications.repository";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [TypeOrmModule.forFeature([Application]), AuditLogsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsRepository, ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
