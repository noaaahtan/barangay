import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Report } from "./report.entity";
import { User } from "../../users/entities/user.entity";

@Entity("report_responses")
export class ReportResponse {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Report ID" })
  @Column({ name: "report_id" })
  reportId: string;

  @ManyToOne(() => Report)
  @JoinColumn({ name: "report_id" })
  report: Report;

  @ApiProperty({ description: "Responder user ID" })
  @Column({ name: "responder_id" })
  responderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "responder_id" })
  responder: User;

  @ApiProperty({ description: "Response text" })
  @Column({ type: "text", name: "response_text" })
  responseText: string;

  @ApiProperty({ description: "Response timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
