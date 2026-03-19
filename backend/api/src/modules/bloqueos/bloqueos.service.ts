import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloqueoHorario } from './entities/bloqueo.entity';
import { User } from '../users/entities/user.entity';
import { IsDateString, IsString } from 'class-validator';

export class CreateBloqueoDto {
    @IsString() id_centro: number;
    @IsDateString() fecha_inicio: string;
    @IsDateString() fecha_fin: string;
    @IsString() motivo: string;
}

@Injectable()
export class BloqueosService {
    constructor(@InjectRepository(BloqueoHorario) private repo: Repository<BloqueoHorario>) { }

    create(dto: CreateBloqueoDto, admin: User) {
        const b = this.repo.create({ ...dto, id_admin: admin.id_usuario });
        return this.repo.save(b);
    }

    findAll() {
        return this.repo.find({ order: { fecha_inicio: 'ASC' } });
    }

    async remove(id: number) {
        await this.repo.delete(id);
        return { message: 'Bloqueo eliminado' };
    }
}
