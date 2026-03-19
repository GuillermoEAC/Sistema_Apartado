import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from '../reservas/entities/reserva.entity';
import { BloqueoHorario } from '../bloqueos/entities/bloqueo.entity';
import { CalendarioService } from './calendario.service';
import { CalendarioController } from './calendario.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Reserva, BloqueoHorario])],
    controllers: [CalendarioController],
    providers: [CalendarioService],
})
export class CalendarioModule { }
