import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Action performed', enum: AuditAction })
  @Column({ type: 'varchar', length: 10 })
  action: AuditAction;

  @ApiProperty({ description: 'Entity type (e.g. item, category)' })
  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @ApiProperty({ description: 'ID of the affected entity' })
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @ApiProperty({ description: 'Name of the entity at time of action' })
  @Column({ name: 'entity_name', length: 200 })
  entityName: string;

  @ApiProperty({ description: 'ID of the user who performed the action' })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Optional details about the change' })
  @Column({ type: 'text', nullable: true })
  details: string | null;

  @ApiProperty({ description: 'Timestamp of the action' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
