import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from '../reservas/entities/reserva.entity';
import { BloqueoHorario } from '../bloqueos/entities/bloqueo.entity';
import { CalendarioService } from './calendario.service';
import { CalendarioController } from './calendario.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reserva, BloqueoHorario]),
        AuthModule,
    ],
    controllers: [CalendarioController],
    providers: [CalendarioService],
})
export class CalendarioModule { }
