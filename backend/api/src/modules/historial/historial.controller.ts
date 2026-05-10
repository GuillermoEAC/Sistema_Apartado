import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('historial')
export class HistorialController {
    constructor(private readonly service: HistorialService) { }

    @Get('mis-acciones')
    findMine(@Request() req, @Query() query: PaginationDto) {
        return this.service.findByUser(req.user.id_usuario, query.page, query.limit);
    }

    @Get()
    @Roles('admin')
    findAll(@Query() query: PaginationDto, @Query('entidad') entidad?: string) {
        return this.service.findAll(query.page, query.limit, entidad, query.buscar);
    }
}
