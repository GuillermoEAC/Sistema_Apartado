import { Controller, Get, Patch, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
    constructor(private readonly service: NotificacionesService) { }

    @Get()
    findAll(@Request() req) {
        return this.service.findForUser(req.user.id_usuario);
    }

    @Patch(':id/leer')
    markRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.service.markAsRead(id, req.user.id_usuario);
    }

    @Patch('leer-todas')
    markAllRead(@Request() req) {
        return this.service.markAllAsRead(req.user.id_usuario);
    }
}
