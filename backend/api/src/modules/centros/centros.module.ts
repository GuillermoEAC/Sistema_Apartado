import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentrosController } from './centros.controller';
import { CentrosService } from './centros.service';
import { CentroComputo } from './entities/centro-computo.entity';
import { Facultad } from '../facultades/entities/facultad.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CentroComputo, Facultad])],
    controllers: [CentrosController],
    providers: [CentrosService],
    exports: [CentrosService],
})
export class CentrosModule { }
