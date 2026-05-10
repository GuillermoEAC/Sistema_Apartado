import {
    Injectable, BadRequestException, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud, SolicitudEstado } from './entities/solicitud.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { HistorialService } from '../historial/historial.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotificacionTipo } from '../notificaciones/entities/notificacion.entity';
import { CreateSolicitudDto, ReviewSolicitudDto } from './dto/solicitud.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SolicitudesService {
    constructor(
        @InjectRepository(Solicitud) private solicitudRepo: Repository<Solicitud>,
        @InjectRepository(Reserva) private reservaRepo: Repository<Reserva>,
        private historialSvc: HistorialService,
        private notifSvc: NotificacionesService,
    ) { }

    async create(dto: CreateSolicitudDto, user: User): Promise<Solicitud> {
        // Verificar conflicto de horario en solicitudes aprobadas o pendientes
        const conflicto = await this.solicitudRepo
            .createQueryBuilder('s')
            .where('s.id_centro = :c', { c: dto.id_centro })
            .andWhere('s.fecha_uso = :f', { f: dto.fecha_uso })
            .andWhere('s.estado IN (:...estados)', { estados: ['pendiente', 'aprobada'] })
            .andWhere('s.hora_inicio < :fin AND s.hora_fin > :inicio', {
                inicio: dto.hora_inicio,
                fin: dto.hora_fin,
            })
            .getOne();

        if (conflicto) {
            throw new BadRequestException(
                'El horario ya tiene una solicitud pendiente o aprobada.',
            );
        }

        const solicitud = this.solicitudRepo.create({
            ...dto,
            id_usuario: user.id_usuario,
            estado: SolicitudEstado.PENDIENTE,
        });
        const saved = await this.solicitudRepo.save(solicitud);
        await this.historialSvc.log(user.id_usuario, 'CREAR_SOLICITUD', 'solicitud', saved.id_solicitud);
        return saved;
    }

    async approve(id: number, dto: ReviewSolicitudDto, admin: User): Promise<Reserva> {
        const s = await this.findOne(id);
        if (s.estado !== SolicitudEstado.PENDIENTE)
            throw new BadRequestException('Solo se pueden aprobar solicitudes pendientes');

        await this.solicitudRepo.update(id, {
            estado: SolicitudEstado.APROBADA,
            id_admin_revisor: admin.id_usuario,
            fecha_revision: new Date(),
        });

        // Crear reserva automáticamente
        const reserva = this.reservaRepo.create({
            id_solicitud: s.id_solicitud,
            id_usuario: s.id_usuario,
            id_centro: s.id_centro,
            fecha_uso: s.fecha_uso,
            hora_inicio: s.hora_inicio,
            hora_fin: s.hora_fin,
        });
        const savedR = await this.reservaRepo.save(reserva);

        // Notificar al profesor
        await this.notifSvc.create({
            id_usuario: s.id_usuario,
            tipo: NotificacionTipo.SOLICITUD_APROBADA,
            titulo: '¡Solicitud aprobada!',
            mensaje: `Tu solicitud para el ${s.fecha_uso} de ${s.hora_inicio} a ${s.hora_fin} fue aprobada.`,
            id_entidad_ref: savedR.id_reserva,
        });

        await this.historialSvc.log(admin.id_usuario, 'APROBAR_SOLICITUD', 'solicitud', id);
        return savedR;
    }

    async reject(id: number, dto: ReviewSolicitudDto, admin: User): Promise<Solicitud> {
        const s = await this.findOne(id);
        if (s.estado !== SolicitudEstado.PENDIENTE)
            throw new BadRequestException('Solo se pueden rechazar solicitudes pendientes');

        await this.solicitudRepo.update(id, {
            estado: SolicitudEstado.RECHAZADA,
            motivo_rechazo: dto.motivo ?? 'Sin motivo indicado',
            id_admin_revisor: admin.id_usuario,
            fecha_revision: new Date(),
        });

        await this.notifSvc.create({
            id_usuario: s.id_usuario,
            tipo: NotificacionTipo.SOLICITUD_RECHAZADA,
            titulo: 'Solicitud rechazada',
            mensaje: dto.motivo ?? 'Tu solicitud fue rechazada',
            id_entidad_ref: id,
        });

        await this.historialSvc.log(admin.id_usuario, 'RECHAZAR_SOLICITUD', 'solicitud', id);
        return this.findOne(id);
    }

    async cancel(id: number, user: User): Promise<Solicitud> {
        const s = await this.findOne(id);
        if (s.id_usuario !== user.id_usuario)
            throw new ForbiddenException('No puedes cancelar una solicitud de otro usuario');
        if (s.estado !== SolicitudEstado.PENDIENTE)
            throw new BadRequestException('Solo puedes cancelar solicitudes pendientes');

        await this.solicitudRepo.update(id, { estado: SolicitudEstado.CANCELADA });
        await this.historialSvc.log(user.id_usuario, 'CANCELAR_SOLICITUD', 'solicitud', id);
        return this.findOne(id);
    }

    findAllForUser(id_usuario: number, page = 1, limit = 20, estado?: string) {
        const qb = this.solicitudRepo.createQueryBuilder('s')
            .where('s.id_usuario = :id_usuario', { id_usuario })
            .orderBy('s.created_at', 'DESC');

        if (estado) qb.andWhere('s.estado = :estado', { estado });

        return qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
            .then(([data, total]) => ({
                data, total, page, limit,
                totalPages: Math.ceil(total / limit),
            }));
    }

    findAll(page = 1, limit = 20, estado?: string, buscar?: string) {
        const qb = this.solicitudRepo.createQueryBuilder('s')
            .leftJoinAndSelect('s.usuario', 'u')
            .orderBy('s.created_at', 'DESC');

        if (estado) qb.andWhere('s.estado = :estado', { estado });
        if (buscar) {
            qb.andWhere('(u.nombre LIKE :b OR u.apellido1 LIKE :b OR s.materia LIKE :b OR s.grupo LIKE :b)', { b: `%${buscar}%` });
        }

        return qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
            .then(([data, total]) => ({
                data, total, page, limit,
                totalPages: Math.ceil(total / limit),
            }));
    }

    private async findOne(id: number): Promise<Solicitud> {
        const s = await this.solicitudRepo.findOne({ where: { id_solicitud: id } });
        if (!s) throw new NotFoundException(`Solicitud #${id} no encontrada`);
        return s;
    }
}
