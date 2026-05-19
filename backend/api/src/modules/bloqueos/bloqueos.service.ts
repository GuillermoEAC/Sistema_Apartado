import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloqueoHorario } from './entities/bloqueo.entity';
import { User } from '../users/entities/user.entity';
import { IsDateString, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBloqueoDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_centro?: number;

    @IsOptional()
    @IsDateString()
    fecha_inicio?: string;

    @IsOptional()
    @IsDateString()
    fecha_fin?: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/)
    startTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/)
    endTime?: string;

    @IsOptional()
    @IsString()
    motivo?: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

@Injectable()
export class BloqueosService {
    constructor(@InjectRepository(BloqueoHorario) private repo: Repository<BloqueoHorario>) { }

    create(dto: CreateBloqueoDto, admin: User) {
        if (!dto.fecha_inicio && (!dto.date || !dto.startTime)) {
            throw new BadRequestException('Fecha y hora de inicio son requeridas');
        }
        if (!dto.fecha_fin && (!dto.date || !dto.endTime)) {
            throw new BadRequestException('Fecha y hora de fin son requeridas');
        }

        const fecha_inicio = dto.fecha_inicio ?? `${dto.date}T${dto.startTime}:00`;
        const fecha_fin = dto.fecha_fin ?? `${dto.date}T${dto.endTime}:00`;
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);

        if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
            throw new BadRequestException('Fecha u horario invalido');
        }

        if (inicio >= fin) {
            throw new BadRequestException('La hora de inicio debe ser menor a la hora de fin');
        }

        const b = this.repo.create({
            id_centro: dto.id_centro ?? 1,
            id_admin: admin.id_usuario,
            fecha_inicio: inicio,
            fecha_fin: fin,
            motivo: dto.motivo ?? dto.reason ?? 'Bloqueo administrativo',
        });
        return this.repo.save(b);
    }

    findAll() {
        return this.repo.find({
            relations: ['admin'],
            order: { fecha_inicio: 'ASC' },
        });
    }

    async remove(id: number) {
        await this.repo.delete(id);
        return { message: 'Bloqueo eliminado' };
    }
}
