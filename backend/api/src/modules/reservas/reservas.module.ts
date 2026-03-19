import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { HistorialModule } from '../historial/historial.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
    imports: [TypeOrmModule.forFeature([Reserva]), HistorialModule, NotificacionesModule],
    controllers: [ReservasController],
    providers: [ReservasService],
    exports: [ReservasService],
})
export class ReservasModule { }
