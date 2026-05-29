import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloqueoHorario } from './entities/bloqueo.entity';
import { BloqueosService } from './bloqueos.service';
import { BloqueosController } from './bloqueos.controller';
import { CentroComputo } from '../centros/entities/centro-computo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BloqueoHorario, CentroComputo])],
    controllers: [BloqueosController],
    providers: [BloqueosService],
    exports: [BloqueosService],
})
export class BloqueosModule { }
