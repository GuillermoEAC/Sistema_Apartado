import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentrosController } from './centros.controller';
import { CentrosService } from './centros.service';
import { CentroComputo } from './entities/centro-computo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CentroComputo])],
    controllers: [CentrosController],
    providers: [CentrosService],
    exports: [CentrosService],
})
export class CentrosModule { }
