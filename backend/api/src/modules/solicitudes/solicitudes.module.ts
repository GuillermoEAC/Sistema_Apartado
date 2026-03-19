import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';
import { HistorialModule } from '../historial/historial.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Solicitud, Reserva]),
        HistorialModule,
        NotificacionesModule,
    ],
    controllers: [SolicitudesController],
    providers: [SolicitudesService],
    exports: [SolicitudesService],
})
export class SolicitudesModule { }
