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
import { EquipmentReservationsService } from "./equipment-reservations.service";
import { CreateEquipmentReservationDto } from "./dto/create-equipment-reservation.dto";
import { UpdateReservationStatusDto } from "./dto/update-reservation-status.dto";
import { UpdateEquipmentReservationDto } from "./dto/update-equipment-reservation.dto";
import { EquipmentReservationsQueryDto } from "./dto/equipment-reservations-query.dto";
import { EquipmentReservation } from "./entities/equipment-reservation.entity";

@ApiTags("Equipment Reservations")
@ApiBearerAuth()
@Controller("equipment-reservations")
export class EquipmentReservationsController {
  constructor(
    private readonly reservationsService: EquipmentReservationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List equipment reservations" })
  @ApiResponse({ status: 200, description: "Paginated list of reservations" })
  findAll(@Query() query: EquipmentReservationsQueryDto, @Request() req: any) {
    return this.reservationsService.findAll(query, req.user.id, req.user.role);
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get equipment reservation metrics" })
  getMetrics() {
    return this.reservationsService.getMetrics();
  }

  @Get("recent")
  @ApiOperation({ summary: "Get recent equipment reservations" })
  getRecent() {
    return this.reservationsService.getRecent(5);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single reservation" })
  @ApiResponse({ status: 200, type: EquipmentReservation })
  findOne(@Param("id", ParseUUIDPipe) id: string, @Request() req: any) {
    return this.reservationsService.findOne(id, req.user.id, req.user.role);
  }

  @Post()
  @ApiOperation({ summary: "Create a new reservation" })
  @ApiResponse({ status: 201, type: EquipmentReservation })
  create(@Body() dto: CreateEquipmentReservationDto, @Request() req: any) {
    return this.reservationsService.create(dto, req.user.id);
  }

  @Post("block")
  @ApiOperation({ summary: "Block equipment for barangay use (admin only)" })
  @ApiResponse({ status: 201, type: EquipmentReservation })
  createBlock(@Body() dto: CreateEquipmentReservationDto, @Request() req: any) {
    return this.reservationsService.createBlock(
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update reservation status (admin only)" })
  @ApiResponse({ status: 200, type: EquipmentReservation })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationStatusDto,
    @Request() req: any,
  ) {
    return this.reservationsService.updateStatus(
      id,
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update reservation details (admin only)" })
  @ApiResponse({ status: 200, type: EquipmentReservation })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipmentReservationDto,
    @Request() req: any,
  ) {
    return this.reservationsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancel a reservation" })
  @ApiResponse({ status: 200, description: "Reservation cancelled" })
  cancel(@Param("id", ParseUUIDPipe) id: string, @Request() req: any) {
    return this.reservationsService.cancel(id, req.user.id, req.user.role);
  }
}
