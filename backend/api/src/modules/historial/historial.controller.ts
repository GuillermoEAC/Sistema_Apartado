import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('historial')
export class HistorialController {
    constructor(private readonly service: HistorialService) { }

    @Get('mis-acciones')
    findMine(@Request() req) {
        return this.service.findByUser(req.user.id_usuario);
    }

    @Get()
    @Roles('admin')
    findAll() {
        return this.service.findAll();
    }
}
