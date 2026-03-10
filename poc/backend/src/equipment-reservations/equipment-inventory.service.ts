import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { EquipmentInventoryRepository } from "./equipment-inventory.repository";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuditAction } from "../audit-logs/entities/audit-log.entity";
import { CreateEquipmentItemDto } from "./dto/create-equipment-item.dto";
import { UpdateEquipmentItemDto } from "./dto/update-equipment-item.dto";
import { EquipmentItem } from "./entities/equipment-item.entity";

@Injectable()
export class EquipmentInventoryService {
  private readonly logger = new Logger(EquipmentInventoryService.name);

  constructor(
    private readonly inventoryRepo: EquipmentInventoryRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(includeInactive: boolean = false): Promise<EquipmentItem[]> {
    this.logger.log(`findAll includeInactive=${includeInactive}`);
    return this.inventoryRepo.findAll({ includeInactive });
  }

  async create(
    dto: CreateEquipmentItemDto,
    userId: string,
    userRole: string,
  ): Promise<EquipmentItem> {
    this.logger.log(`create type=${dto.type} userId=${userId}`);
    this.assertAdmin(userRole);

    const existing = await this.inventoryRepo.findByType(dto.type);
    if (existing) {
      throw new BadRequestException(
        `Equipment type ${dto.type} already exists. Update the existing item instead.`,
      );
    }

    const created = await this.inventoryRepo.create({
      type: dto.type,
      name: dto.name,
      quantityTotal: dto.quantityTotal,
      isActive: true,
    });

    await this.auditLogsService.log(
      AuditAction.CREATE,
      "equipment_item",
      created.id,
      created.name,
      userId,
      `Created equipment item ${created.name} (${created.type})`,
    );

    return created;
  }

  async update(
    id: string,
    dto: UpdateEquipmentItemDto,
    userId: string,
    userRole: string,
  ): Promise<EquipmentItem> {
    this.logger.log(`update id=${id} userId=${userId}`);
    this.assertAdmin(userRole);

    const item = await this.inventoryRepo.findById(id);
    if (!item) {
      throw new NotFoundException(`Equipment item with id "${id}" not found`);
    }

    Object.assign(item, dto);
    const saved = await this.inventoryRepo.save(item);

    await this.auditLogsService.log(
      AuditAction.UPDATE,
      "equipment_item",
      saved.id,
      saved.name,
      userId,
      "Updated equipment item",
    );

    return saved;
  }

  async deactivate(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    this.logger.log(`deactivate id=${id} userId=${userId}`);
    this.assertAdmin(userRole);

    const item = await this.inventoryRepo.findById(id);
    if (!item) {
      throw new NotFoundException(`Equipment item with id "${id}" not found`);
    }

    if (!item.isActive) {
      throw new BadRequestException("Equipment item is already inactive");
    }

    item.isActive = false;
    await this.inventoryRepo.save(item);

    await this.auditLogsService.log(
      AuditAction.DELETE,
      "equipment_item",
      item.id,
      item.name,
      userId,
      "Deactivated equipment item",
    );
  }

  private assertAdmin(userRole: string) {
    if (userRole?.toLowerCase() !== "admin") {
      throw new ForbiddenException("Admin access required");
    }
  }
}
