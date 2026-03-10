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
import { ESumbongService } from "./e-sumbong.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportStatusDto } from "./dto/update-report-status.dto";
import { AddResponseDto } from "./dto/add-response.dto";
import { ResolveReportDto } from "./dto/resolve-report.dto";
import { ReportsQueryDto } from "./dto/reports-query.dto";
import { Report } from "./entities/report.entity";
import { ReportResponse } from "./entities/report-response.entity";

@ApiTags("E-Sumbong")
@ApiBearerAuth()
@Controller("e-sumbong")
export class ESumbongController {
  constructor(private readonly esumbongService: ESumbongService) {}

  @Get("reports")
  @ApiOperation({
    summary:
      "List reports (role-based: citizens see own, police/admin see all)",
  })
  @ApiResponse({ status: 200, description: "Paginated list of reports" })
  findAll(@Query() query: ReportsQueryDto, @Request() req: any) {
    return this.esumbongService.findAll(query, req.user.id, req.user.role);
  }

  @Get("analytics")
  @ApiOperation({ summary: "Get e-sumbong analytics" })
  @ApiResponse({ status: 200, description: "E-sumbong metrics" })
  getAnalytics() {
    return this.esumbongService.getAnalytics();
  }

  @Get("reports/:id")
  @ApiOperation({ summary: "Get a single report by ID with responses" })
  @ApiResponse({ status: 200, type: Report })
  @ApiResponse({ status: 404, description: "Report not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string, @Request() req: any) {
    return this.esumbongService.findOne(id, req.user.id, req.user.role);
  }

  @Post("reports")
  @ApiOperation({ summary: "Submit a new report" })
  @ApiResponse({ status: 201, type: Report })
  create(@Body() dto: CreateReportDto, @Request() req: any) {
    return this.esumbongService.create(dto, req.user.id);
  }

  @Patch("reports/:id/status")
  @ApiOperation({ summary: "Update report status (police/admin only)" })
  @ApiResponse({ status: 200, type: Report })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
    @Request() req: any,
  ) {
    return this.esumbongService.updateStatus(
      id,
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Post("reports/:id/responses")
  @ApiOperation({ summary: "Add a response to a report (police/admin only)" })
  @ApiResponse({ status: 201, type: ReportResponse })
  @ApiResponse({ status: 403, description: "Forbidden" })
  addResponse(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddResponseDto,
    @Request() req: any,
  ) {
    return this.esumbongService.addResponse(
      id,
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Patch("reports/:id/resolve")
  @ApiOperation({ summary: "Resolve a report (police/admin only)" })
  @ApiResponse({ status: 200, type: Report })
  @ApiResponse({ status: 403, description: "Forbidden" })
  resolve(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ResolveReportDto,
    @Request() req: any,
  ) {
    return this.esumbongService.resolve(id, dto, req.user.id, req.user.role);
  }

  @Delete("reports/:id")
  @ApiOperation({ summary: "Delete a report (admin only)" })
  @ApiResponse({ status: 204, description: "Report deleted" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async delete(@Param("id", ParseUUIDPipe) id: string, @Request() req: any) {
    await this.esumbongService.delete(id, req.user.id, req.user.role);
    return { message: "Report deleted successfully" };
  }
}
