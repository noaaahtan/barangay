import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EquipmentReservationsController } from "./equipment-reservations.controller";
import { EquipmentInventoryController } from "./equipment-inventory.controller";
import { EquipmentReservationsService } from "./equipment-reservations.service";
import { EquipmentInventoryService } from "./equipment-inventory.service";
import { EquipmentReservationsRepository } from "./equipment-reservations.repository";
import { EquipmentInventoryRepository } from "./equipment-inventory.repository";
import { EquipmentReservation } from "./entities/equipment-reservation.entity";
import { EquipmentItem } from "./entities/equipment-item.entity";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipmentReservation, EquipmentItem]),
    AuditLogsModule,
  ],
  controllers: [EquipmentReservationsController, EquipmentInventoryController],
  providers: [
    EquipmentReservationsService,
    EquipmentInventoryService,
    EquipmentReservationsRepository,
    EquipmentInventoryRepository,
  ],
  exports: [EquipmentReservationsService, EquipmentInventoryService],
})
export class EquipmentReservationsModule {}
