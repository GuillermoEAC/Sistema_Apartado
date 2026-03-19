import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, NotificacionTipo } from './entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
    constructor(@InjectRepository(Notificacion) private repo: Repository<Notificacion>) { }

    create(data: {
        id_usuario: number;
        tipo: NotificacionTipo;
        titulo: string;
        mensaje: string;
        id_entidad_ref?: number;
    }) {
        const n = this.repo.create(data);
        return this.repo.save(n);
    }

    findForUser(id_usuario: number) {
        return this.repo.find({
            where: { id_usuario },
            order: { created_at: 'DESC' },
        });
    }

    async markAsRead(id: number, id_usuario: number) {
        await this.repo.update({ id_notificacion: id, id_usuario }, { leida: true });
        return { message: 'Notificación marcada como leída' };
    }

    async markAllAsRead(id_usuario: number) {
        await this.repo.update({ id_usuario, leida: false }, { leida: true });
        return { message: 'Todas las notificaciones marcadas como leídas' };
    }
}
