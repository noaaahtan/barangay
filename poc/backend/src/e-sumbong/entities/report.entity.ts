import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/entities/user.entity";
import {
  ReportType,
  ReportStatus,
  ReportSeverity,
} from "../../common/constants";

@Entity("reports")
export class Report {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Reference number", example: "RPT-2026-000001" })
  @Column({ unique: true, name: "reference_number" })
  referenceNumber: string;

  @ApiProperty({ description: "Report type", enum: ReportType })
  @Column({ type: "varchar", length: 50 })
  type: ReportType;

  @ApiProperty({ description: "Severity level", enum: ReportSeverity })
  @Column({ type: "varchar", length: 20 })
  severity: ReportSeverity;

  @ApiProperty({ description: "Report status", enum: ReportStatus })
  @Column({ type: "varchar", length: 20 })
  status: ReportStatus;

  @ApiProperty({ description: "Report title", maxLength: 200 })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: "Detailed description" })
  @Column({ type: "text" })
  description: string;

  @ApiProperty({ description: "Location latitude", example: 14.5995 })
  @Column({ type: "decimal", precision: 10, scale: 8 })
  latitude: number;

  @ApiProperty({ description: "Location longitude", example: 120.9842 })
  @Column({ type: "decimal", precision: 11, scale: 8 })
  longitude: number;

  @ApiProperty({
    description: "Human-readable location address",
    required: false,
  })
  @Column({
    type: "varchar",
    length: 300,
    nullable: true,
    name: "location_address",
  })
  locationAddress?: string;

  @ApiProperty({ description: "Whether report is anonymous", default: false })
  @Column({ default: false, name: "is_anonymous" })
  isAnonymous: boolean;

  @ApiProperty({ description: "Array of photo URLs", type: [String] })
  @Column({ type: "json", default: "[]", name: "photo_urls" })
  photoUrls: string[];

  @ApiProperty({ description: "User ID of reporter" })
  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ApiProperty({ description: "User ID of reviewer", required: false })
  @Column({ name: "reviewed_by", nullable: true })
  reviewedBy?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "reviewed_by" })
  reviewer?: User;

  @ApiProperty({ description: "Review timestamp", required: false })
  @Column({ type: "timestamp", nullable: true, name: "reviewed_at" })
  reviewedAt?: Date;

  @ApiProperty({ description: "Resolution timestamp", required: false })
  @Column({ type: "timestamp", nullable: true, name: "resolved_at" })
  resolvedAt?: Date;

  @ApiProperty({ description: "Resolution details", required: false })
  @Column({ type: "text", nullable: true, name: "resolution_details" })
  resolutionDetails?: string;

  @ApiProperty({ description: "Submission timestamp" })
  @CreateDateColumn({ name: "submitted_at" })
  submittedAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "last_updated_at" })
  lastUpdatedAt: Date;
}
