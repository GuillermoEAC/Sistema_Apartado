import { Controller, Get, Request } from '@nestjs/common';
import { CalendarioService } from './calendario.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Calendario')
@Controller('calendario')
export class CalendarioController {
    constructor(
        private readonly service: CalendarioService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Endpoint publico - si hay token valido, devuelve datos extra.
     * Sin token o token invalido: solo muestra "Ocupado".
     */
    @Public()
    @Get('eventos')
    @ApiOperation({ summary: 'Obtener eventos del calendario (publico y autenticado)' })
    getEventos(@Request() req) {
        let user: any = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = this.jwtService.verify(token);
                user = {
                    id_usuario: payload.sub,
                    rol: payload.rol,
                };
            } catch (err) {
                // Token invalido o expirado, se trata como publico
            }
        }
        return this.service.getEventos(user?.rol, user?.id_usuario);
    }
}
