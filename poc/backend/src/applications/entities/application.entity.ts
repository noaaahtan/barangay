import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApplicationType, ApplicationStatus } from "../../common/constants";
import { User } from "../../users/entities/user.entity";

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  referenceNumber: string;

  @Column({
    type: "enum",
    enum: ApplicationType,
  })
  type: ApplicationType;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @Column()
  applicantName: string;

  @Column()
  applicantEmail: string;

  @Column()
  applicantPhone: string;

  @Column("text")
  applicantAddress: string;

  @Column("text")
  purpose: string;

  @Column("text", { nullable: true })
  notes: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid", nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "reviewedBy" })
  reviewer: User;

  @Column({ type: "timestamp" })
  submittedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  reviewedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
