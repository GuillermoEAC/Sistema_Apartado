import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './entities/historial.entity';

@Injectable()
export class HistorialService {
    constructor(@InjectRepository(Historial) private repo: Repository<Historial>) { }

    async log(
        id_usuario: number | null,
        accion: string,
        entidad: string,
        id_entidad: number,
        detalle?: string,
    ) {
        const h = this.repo.create({ id_usuario, accion, entidad, id_entidad, detalle });
        return this.repo.save(h);
    }

    findByUser(id_usuario: number, page = 1, limit = 20) {
        return this.repo.createQueryBuilder('h')
            .where('h.id_usuario = :id_usuario', { id_usuario })
            .orderBy('h.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
            .then(([data, total]) => ({
                data, total, page, limit,
                totalPages: Math.ceil(total / limit),
            }));
    }

    findAll(page = 1, limit = 20, entidad?: string, buscar?: string) {
        const qb = this.repo.createQueryBuilder('h')
            .orderBy('h.created_at', 'DESC');

        if (entidad) qb.andWhere('h.entidad = :entidad', { entidad });
        if (buscar) qb.andWhere('(h.accion LIKE :b OR h.detalle LIKE :b)', { b: `%${buscar}%` });

        return qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
            .then(([data, total]) => ({
                data, total, page, limit,
                totalPages: Math.ceil(total / limit),
            }));
    }
}
