import {
    Controller, Delete, Get, Post, Patch, Param, Body, Query,
    UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

class CreateUserDto {
    @IsString() nombre: string;
    @IsString() apellido1: string;
    @IsOptional() @IsString() apellido2?: string;
    @IsEmail() correo: string;
    @IsString() @MinLength(6) password: string;
    @IsOptional() @IsString() rol?: 'profesor' | 'admin';
}

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly service: UsersService) { }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Listar todos los usuarios (Admin)' })
    findAll(@Query() query: PaginationDto) {
        return this.service.findAll(query.page, query.limit, query.buscar);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Crear nuevo usuario (Admin)' })
    create(@Body() dto: CreateUserDto) {
        return this.service.create(dto as any);
    }

    @Patch(':id/toggle-active')
    @Roles('admin')
    @ApiOperation({ summary: 'Activar/desactivar usuario (Admin)' })
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.service.toggleActive(id);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Desactivar usuario (Admin)' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.deactivate(id);
    }
}
