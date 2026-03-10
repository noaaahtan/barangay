import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import {
  EquipmentReservationStatus,
  EquipmentType,
  EventType,
} from "../../common/constants";
import { User } from "../../users/entities/user.entity";

export interface EquipmentReservationItem {
  type: EquipmentType;
  quantity: number;
}

@Entity("equipment_reservations")
export class EquipmentReservation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, name: "reference_number" })
  referenceNumber: string;

  @Column({
    type: "enum",
    enum: EquipmentReservationStatus,
    default: EquipmentReservationStatus.SUBMITTED,
  })
  status: EquipmentReservationStatus;

  @Column({
    type: "enum",
    enum: EventType,
    name: "event_type",
  })
  eventType: EventType;

  @Column({ name: "event_name", length: 200 })
  eventName: string;

  @Column({ name: "event_location", length: 255 })
  eventLocation: string;

  @Column({ type: "date", name: "start_date" })
  startDate: string;

  @Column({ type: "date", name: "end_date" })
  endDate: string;

  @Column({ type: "jsonb", name: "requested_items" })
  requestedItems: EquipmentReservationItem[];

  @Column({ type: "jsonb", name: "approved_items", nullable: true })
  approvedItems: EquipmentReservationItem[] | null;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({ type: "uuid", name: "user_id" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "uuid", name: "reviewed_by", nullable: true })
  reviewedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: "reviewed_by" })
  reviewer: User | null;

  @Column({ type: "timestamp", name: "reviewed_at", nullable: true })
  reviewedAt: Date | null;

  @Column({ type: "timestamp", name: "fulfilled_at", nullable: true })
  fulfilledAt: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
