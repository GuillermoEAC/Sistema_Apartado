import {
    Controller, Get, Post, Patch, Param,
    Body, UseGuards, Request, ParseIntPipe, Query,
} from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto, ReviewSolicitudDto } from './dto/solicitud.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Solicitudes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('solicitudes')
export class SolicitudesController {
    constructor(private readonly service: SolicitudesService) { }

    @Post()
    @Roles('profesor')
    @ApiOperation({ summary: 'Crear solicitud de reserva (Profesor)' })
    create(@Body() dto: CreateSolicitudDto, @Request() req) {
        return this.service.create(dto, req.user);
    }

    @Get('mis-solicitudes')
    @Roles('profesor')
    @ApiOperation({ summary: 'Ver mis solicitudes (Profesor)' })
    findMine(@Request() req, @Query() query: PaginationDto, @Query('estado') estado?: string) {
        return this.service.findAllForUser(req.user.id_usuario, query.page, query.limit, estado);
    }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Ver todas las solicitudes (Admin)' })
    findAll(@Query() query: PaginationDto, @Query('estado') estado?: string) {
        return this.service.findAll(query.page, query.limit, estado, query.buscar);
    }

    @Post(':id/aprobar')
    @Roles('admin')
    @ApiOperation({ summary: 'Aprobar solicitud y crear reserva (Admin)' })
    approve(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ReviewSolicitudDto,
        @Request() req,
    ) {
        return this.service.approve(id, dto, req.user);
    }

    @Post(':id/rechazar')
    @Roles('admin')
    @ApiOperation({ summary: 'Rechazar solicitud (Admin)' })
    reject(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ReviewSolicitudDto,
        @Request() req,
    ) {
        return this.service.reject(id, dto, req.user);
    }

    @Patch(':id/cancelar')
    @Roles('profesor')
    @ApiOperation({ summary: 'Cancelar solicitud pendiente (Profesor)' })
    cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.service.cancel(id, req.user);
    }
}
