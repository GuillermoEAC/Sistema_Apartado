import {
    Controller, Get, Post, Delete, Param,
    Body, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { BloqueosService, CreateBloqueoDto } from './bloqueos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bloqueos')
@Controller('bloqueos')
export class BloqueosController {
    constructor(private readonly service: BloqueosService) { }

    @Public()
    @Get()
    findAll() {
        return this.service.findAll();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() dto: CreateBloqueoDto, @Request() req) {
        return this.service.create(dto, req.user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
