import {
    Controller, Get, Patch, Param, Body,
    UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ReservasService, RescheduleDto, AttendanceDto } from './reservas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class CancelDto {
    @IsOptional() @IsString() motivo?: string;
}

@ApiTags('Reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservas')
export class ReservasController {
    constructor(private readonly service: ReservasService) { }

    @Get('mis-reservas')
    @ApiOperation({ summary: 'Mis reservas (Profesor)' })
    findMine(@Request() req) {
        return this.service.findAllForUser(req.user.id_usuario);
    }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Todas las reservas (Admin)' })
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalle de una reserva' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id/cancelar')
    @ApiOperation({ summary: 'Cancelar reserva' })
    cancel(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CancelDto,
        @Request() req,
    ) {
        return this.service.cancel(id, req.user, dto.motivo);
    }

    @Patch(':id/reprogramar')
    @Roles('profesor')
    @ApiOperation({ summary: 'Reprogramar reserva (Profesor)' })
    reschedule(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RescheduleDto,
        @Request() req,
    ) {
        return this.service.reschedule(id, dto, req.user);
    }

    @Patch(':id/asistencia')
    @Roles('profesor')
    @ApiOperation({ summary: 'Confirmar asistencia (Profesor)' })
    attendance(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AttendanceDto,
        @Request() req,
    ) {
        return this.service.confirmAttendance(id, dto, req.user);
    }
}
