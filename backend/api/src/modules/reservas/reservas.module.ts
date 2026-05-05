import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { BloqueoHorario } from '../bloqueos/entities/bloqueo.entity';
import { CentroComputo } from '../centros/entities/centro-computo.entity';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { HistorialModule } from '../historial/historial.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reserva, Solicitud, BloqueoHorario, CentroComputo]),
        HistorialModule,
        NotificacionesModule,
    ],
    controllers: [ReservasController],
    providers: [ReservasService],
    exports: [ReservasService],
})
export class ReservasModule { }
