import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { CalendarioService } from './calendario.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Calendario')
@Controller('calendario')
export class CalendarioController {
    constructor(private readonly service: CalendarioService) { }

    /**
     * Endpoint público — si hay token válido, devuelve datos extra.
     * Sin token o token inválido: solo muestra "Ocupado".
     */
    @Public()
    @UseGuards(JwtAuthGuard)
    @Get('eventos')
    @ApiOperation({ summary: 'Obtener eventos del calendario (público y autenticado)' })
    getEventos(@Request() req) {
        const user = req.user;
        return this.service.getEventos(user?.rol, user?.id_usuario);
    }
}
