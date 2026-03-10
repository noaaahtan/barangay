import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Full name' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'Email address' })
  @Column({ unique: true, length: 200 })
  email: string;

  @ApiProperty({ description: 'User role', enum: ['admin', 'citizen'] })
  @Column({ type: 'varchar', length: 20, default: 'citizen' })
  role: 'admin' | 'citizen';

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
