import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/entities/audit-log.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepo: CategoriesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepo.findAll();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto, userId: string): Promise<Category> {
    const existing = await this.categoriesRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Category with name "${dto.name}" already exists`);
    }
    const category = await this.categoriesRepo.create(dto);

    await this.auditLogsService.log(
      AuditAction.CREATE,
      'category',
      category.id,
      category.name,
      userId,
      `Created category "${category.name}"`,
    );

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoriesRepo.findByName(dto.name);
      if (existing) {
        throw new ConflictException(`Category with name "${dto.name}" already exists`);
      }
    }

    const oldName = category.name;
    Object.assign(category, dto);
    const updated = await this.categoriesRepo.save(category);

    const details = dto.name && dto.name !== oldName
      ? `Renamed from "${oldName}" to "${dto.name}"`
      : 'Updated category';

    await this.auditLogsService.log(
      AuditAction.UPDATE,
      'category',
      updated.id,
      updated.name,
      userId,
      details,
    );

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepo.remove(category);

    await this.auditLogsService.log(
      AuditAction.DELETE,
      'category',
      id,
      category.name,
      userId,
      `Deleted category "${category.name}"`,
    );
  }
}
