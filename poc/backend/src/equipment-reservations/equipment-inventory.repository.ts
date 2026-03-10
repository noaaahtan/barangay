import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EquipmentItem } from "./entities/equipment-item.entity";
import { EquipmentType } from "../common/constants";

export interface FindAllEquipmentItemsOptions {
  includeInactive?: boolean;
  type?: EquipmentType;
}

@Injectable()
export class EquipmentInventoryRepository {
  constructor(
    @InjectRepository(EquipmentItem)
    private readonly repo: Repository<EquipmentItem>,
  ) {}

  async findAll(options: FindAllEquipmentItemsOptions = {}) {
    const { includeInactive = false, type } = options;
    const qb = this.repo
      .createQueryBuilder("equipment")
      .orderBy("equipment.createdAt", "DESC");

    if (!includeInactive) {
      qb.andWhere("equipment.is_active = true");
    }

    if (type) {
      qb.andWhere("equipment.type = :type", { type });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<EquipmentItem | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByType(type: EquipmentType): Promise<EquipmentItem | null> {
    return this.repo.findOne({ where: { type } });
  }

  async create(data: Partial<EquipmentItem>): Promise<EquipmentItem> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async save(item: EquipmentItem): Promise<EquipmentItem> {
    return this.repo.save(item);
  }
}
