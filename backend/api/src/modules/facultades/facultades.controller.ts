import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateFacultadDto, UpdateFacultadDto } from './dto/facultad.dto';
import { FacultadesService } from './facultades.service';

@ApiTags('Facultades')
@Controller('facultades')
export class FacultadesController {
    constructor(private readonly service: FacultadesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar facultades activas' })
    findActive() {
        return this.service.findActive();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin')
    @ApiOperation({ summary: 'Listar todas las facultades, incluyendo inactivas (Admin)' })
    findAll() {
        return this.service.findAll();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    @ApiOperation({ summary: 'Crear facultad (Admin)' })
    create(@Body() dto: CreateFacultadDto) {
        return this.service.create(dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar facultad (Admin)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFacultadDto) {
        return this.service.update(id, dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id/toggle-active')
    @ApiOperation({ summary: 'Activar/desactivar facultad (Admin)' })
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.service.toggleActive(id);
    }
}
