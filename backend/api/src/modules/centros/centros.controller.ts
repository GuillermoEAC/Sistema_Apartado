import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentrosService } from './centros.service';
import { CreateCentroComputoDto, UpdateCentroComputoDto } from './dto/centro-computo.dto';

@ApiTags('Centros de Cómputo')
@Controller('centros')
export class CentrosController {
    constructor(private readonly service: CentrosService) { }

    @Get()
    @ApiOperation({ summary: 'Listar centros activos' })
    findActive(@Query('facultad') facultad?: string) {
        return this.service.findActive(facultad);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin')
    @ApiOperation({ summary: 'Listar todos los centros, incluyendo inactivos (Admin)' })
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalle de centro de cómputo' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    @ApiOperation({ summary: 'Crear centro de cómputo (Admin)' })
    create(@Body() dto: CreateCentroComputoDto) {
        return this.service.create(dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar centro de cómputo (Admin)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCentroComputoDto) {
        return this.service.update(id, dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id/toggle-active')
    @ApiOperation({ summary: 'Activar/desactivar centro de cómputo (Admin)' })
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.service.toggleActive(id);
    }

}
