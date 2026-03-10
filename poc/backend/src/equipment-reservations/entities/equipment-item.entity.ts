import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { EquipmentType } from "../../common/constants";

@Entity("equipment_items")
export class EquipmentItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: EquipmentType,
  })
  type: EquipmentType;

  @Column({ length: 200 })
  name: string;

  @Column({ type: "int", name: "quantity_total" })
  quantityTotal: number;

  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
