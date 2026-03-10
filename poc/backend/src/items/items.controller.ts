import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseUUIDPipe,
  // UseInterceptors,
  // UploadedFile,
  // BadRequestException,
} from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, /* ApiConsumes, ApiBody, */ ApiBearerAuth } from '@nestjs/swagger';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import { v4 as uuid } from 'uuid';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ItemsQueryDto } from './dto/items-query.dto';
import { Item } from './entities/item.entity';

// --- Image upload disabled (no storage bucket configured) ---
// const imageFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
//   if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
//     return cb(new BadRequestException('Only image files are allowed'), false);
//   }
//   cb(null, true);
// };
//
// const storage = diskStorage({
//   destination: './uploads/items',
//   filename: (_req, file, cb) => {
//     const uniqueName = `${uuid()}${extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

@ApiTags('Items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List items with search, filter, and pagination' })
  findAll(@Query() query: ItemsQueryDto) {
    return this.itemsService.findAll(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'List items below their low-stock threshold' })
  @ApiResponse({ status: 200, type: [Item] })
  findLowStock() {
    return this.itemsService.findLowStock();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get inventory dashboard statistics' })
  getStats() {
    return this.itemsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single item by ID' })
  @ApiResponse({ status: 200, type: Item })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, type: Item })
  create(@Body() dto: CreateItemDto, @Request() req: any) {
    return this.itemsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item' })
  @ApiResponse({ status: 200, type: Item })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemDto,
    @Request() req: any,
  ) {
    return this.itemsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.itemsService.remove(id, req.user.id);
  }

  @Post(':id/adjust-stock')
  @ApiOperation({ summary: 'Adjust item stock with a reason' })
  @ApiResponse({ status: 200, type: Item })
  adjustStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustStockDto,
    @Request() req: any,
  ) {
    return this.itemsService.adjustStock(id, dto, req.user.id);
  }

  // --- Image upload disabled (no storage bucket configured) ---
  // @Post(':id/upload-image')
  // @ApiOperation({ summary: 'Upload a product image for an item' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: { file: { type: 'string', format: 'binary' } },
  //   },
  // })
  // @UseInterceptors(FileInterceptor('file', { storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  // async uploadImage(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Request() req: any,
  // ) {
  //   if (!file) {
  //     throw new BadRequestException('Image file is required');
  //   }
  //   const imageUrl = `/uploads/items/${file.filename}`;
  //   return this.itemsService.update(id, { imageUrl }, req.user.id);
  // }
}
