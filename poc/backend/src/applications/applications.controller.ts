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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { ApplicationsQueryDto } from "./dto/applications-query.dto";
import { Application } from "./entities/application.entity";

@ApiTags("Applications")
@ApiBearerAuth()
@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({
    summary: "List applications (role-based: admins see all, citizens see own)",
  })
  @ApiResponse({ status: 200, description: "Paginated list of applications" })
  findAll(@Query() query: ApplicationsQueryDto, @Request() req: any) {
    return this.applicationsService.findAll(query, req.user.id, req.user.role);
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get applications dashboard metrics" })
  @ApiResponse({ status: 200, description: "Applications metrics" })
  getMetrics() {
    return this.applicationsService.getMetrics();
  }

  @Get("recent")
  @ApiOperation({ summary: "Get recent applications" })
  @ApiResponse({ status: 200, description: "Recent applications" })
  getRecent() {
    return this.applicationsService.getRecent(5);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single application by ID" })
  @ApiResponse({ status: 200, type: Application })
  @ApiResponse({ status: 404, description: "Application not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string, @Request() req: any) {
    return this.applicationsService.findOne(id, req.user.id, req.user.role);
  }

  @Post()
  @ApiOperation({ summary: "Submit a new application" })
  @ApiResponse({ status: 201, type: Application })
  create(@Body() dto: CreateApplicationDto, @Request() req: any) {
    return this.applicationsService.create(dto, req.user.id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update application status (admin/staff only)" })
  @ApiResponse({ status: 200, type: Application })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req: any,
  ) {
    return this.applicationsService.updateStatus(
      id,
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update application details (admin/staff only)" })
  @ApiResponse({ status: 200, type: Application })
  @ApiResponse({ status: 403, description: "Forbidden" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDto,
    @Request() req: any,
  ) {
    return this.applicationsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Cancel application (admins cancel any, citizens cancel own)",
  })
  @ApiResponse({ status: 200, description: "Application cancelled" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  cancel(@Param("id", ParseUUIDPipe) id: string, @Request() req: any) {
    return this.applicationsService.cancel(id, req.user.id, req.user.role);
  }
}
