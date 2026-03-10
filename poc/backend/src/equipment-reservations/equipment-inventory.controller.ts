import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { EquipmentInventoryService } from "./equipment-inventory.service";
import { EquipmentReservationsService } from "./equipment-reservations.service";
import { CreateEquipmentItemDto } from "./dto/create-equipment-item.dto";
import { UpdateEquipmentItemDto } from "./dto/update-equipment-item.dto";
import { AvailabilityQueryDto } from "./dto/availability-query.dto";
import { EquipmentItem } from "./entities/equipment-item.entity";

@ApiTags("Equipment Inventory")
@ApiBearerAuth()
@Controller("equipment")
export class EquipmentInventoryController {
  constructor(
    private readonly inventoryService: EquipmentInventoryService,
    private readonly reservationsService: EquipmentReservationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List equipment inventory" })
  @ApiResponse({ status: 200, type: [EquipmentItem] })
  findAll(@Request() req: any) {
    const includeInactive = req.user?.role?.toLowerCase() === "admin";
    return this.inventoryService.findAll(includeInactive);
  }

  @Get("availability")
  @ApiOperation({ summary: "Get availability for date range" })
  getAvailability(@Query() query: AvailabilityQueryDto) {
    return this.reservationsService.getAvailability(
      query.startDate,
      query.endDate,
    );
  }

  @Post()
  @ApiOperation({ summary: "Create equipment item (admin only)" })
  @ApiResponse({ status: 201, type: EquipmentItem })
  create(@Body() dto: CreateEquipmentItemDto, @Request() req: any) {
    return this.inventoryService.create(dto, req.user.id, req.user.role);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update equipment item (admin only)" })
  @ApiResponse({ status: 200, type: EquipmentItem })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipmentItemDto,
    @Request() req: any,
  ) {
    return this.inventoryService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate equipment item (admin only)" })
  @ApiResponse({ status: 200 })
  remove(@Param("id", ParseUUIDPipe) id: string, @Request() req: any) {
    return this.inventoryService.deactivate(id, req.user.id, req.user.role);
  }
}
