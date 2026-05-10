import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { BloqueoHorario } from '../bloqueos/entities/bloqueo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Solicitud, Reserva, BloqueoHorario])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
