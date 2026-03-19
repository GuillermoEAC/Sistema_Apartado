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

    findByUser(id_usuario: number) {
        return this.repo.find({ where: { id_usuario }, order: { created_at: 'DESC' } });
    }

    findAll() {
        return this.repo.find({ order: { created_at: 'DESC' } });
    }
}
