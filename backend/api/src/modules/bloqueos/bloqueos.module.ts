import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloqueoHorario } from './entities/bloqueo.entity';
import { BloqueosService } from './bloqueos.service';
import { BloqueosController } from './bloqueos.controller';

@Module({
    imports: [TypeOrmModule.forFeature([BloqueoHorario])],
    controllers: [BloqueosController],
    providers: [BloqueosService],
    exports: [BloqueosService],
})
export class BloqueosModule { }
