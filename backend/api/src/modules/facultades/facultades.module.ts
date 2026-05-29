import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facultad } from './entities/facultad.entity';
import { FacultadesController } from './facultades.controller';
import { FacultadesService } from './facultades.service';

@Module({
    imports: [TypeOrmModule.forFeature([Facultad])],
    controllers: [FacultadesController],
    providers: [FacultadesService],
})
export class FacultadesModule { }
