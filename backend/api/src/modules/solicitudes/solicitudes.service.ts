import {
    Injectable, BadRequestException, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud, SolicitudEstado } from './entities/solicitud.entity';
import { Reserva, ReservaEstado } from '../reservas/entities/reserva.entity';
import { BloqueoHorario } from '../bloqueos/entities/bloqueo.entity';
import { CentroComputo } from '../centros/entities/centro-computo.entity';
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
        @InjectRepository(BloqueoHorario) private bloqueoRepo: Repository<BloqueoHorario>,
        @InjectRepository(CentroComputo) private centroRepo: Repository<CentroComputo>,
        private historialSvc: HistorialService,
        private notifSvc: NotificacionesService,
    ) { }

    // ================================================================
    // CREAR SOLICITUD (Profesor)
    // ================================================================
    async create(dto: CreateSolicitudDto, user: User): Promise<Solicitud> {
        // 1. Validar que el centro exista y este activo
        const centro = await this.centroRepo.findOne({
            where: { id_centro: dto.id_centro, activo: true },
        });
        if (!centro) {
            throw new BadRequestException('El centro de computo no existe o no esta disponible');
        }

        // 2. Validar que num_alumnos no exceda la capacidad
        if (dto.num_alumnos > centro.capacidad) {
            throw new BadRequestException(
                `El numero de alumnos (${dto.num_alumnos}) excede la capacidad del centro (${centro.capacidad})`,
            );
        }

        // 3. Validar que la fecha no sea pasada
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaSolicitud = new Date(dto.fecha_uso + 'T00:00:00');
        if (fechaSolicitud < hoy) {
            throw new BadRequestException('No puedes solicitar una fecha pasada');
        }

        // 4. Validar que hora_inicio < hora_fin
        if (dto.hora_inicio >= dto.hora_fin) {
            throw new BadRequestException('La hora de inicio debe ser menor a la hora de fin');
        }

        // 5. Validar horario dentro del rango permitido (07:00 - 21:00)
        if (dto.hora_inicio < '07:00' || dto.hora_fin > '21:00') {
            throw new BadRequestException('El horario debe estar entre 07:00 y 21:00');
        }

        // 6. Verificar conflicto con bloqueos de horario
        const horaInicio = dto.hora_inicio.length === 5 ? `${dto.hora_inicio}:00` : dto.hora_inicio;
        const horaFin = dto.hora_fin.length === 5 ? `${dto.hora_fin}:00` : dto.hora_fin;
        const fechaInicio = `${dto.fecha_uso} ${horaInicio}`;
        const fechaFin = `${dto.fecha_uso} ${horaFin}`;

        const bloqueo = await this.bloqueoRepo
            .createQueryBuilder('b')
            .where('b.id_centro = :c', { c: dto.id_centro })
            .andWhere('b.fecha_inicio < :fin AND b.fecha_fin > :inicio', {
                inicio: fechaInicio,
                fin: fechaFin,
            })
            .getOne();

        if (bloqueo) {
            throw new BadRequestException(
                `El horario esta bloqueado: ${bloqueo.motivo}`,
            );
        }

        // 7. Verificar conflicto con solicitudes pendientes o aprobadas
        const conflictoSolicitud = await this.solicitudRepo
            .createQueryBuilder('s')
            .where('s.id_centro = :c', { c: dto.id_centro })
            .andWhere('s.fecha_uso = :f', { f: dto.fecha_uso })
            .andWhere('s.estado IN (:...estados)', { estados: ['pendiente', 'aprobada'] })
            .andWhere('s.hora_inicio < :fin AND s.hora_fin > :inicio', {
                inicio: dto.hora_inicio,
                fin: dto.hora_fin,
            })
            .getOne();

        if (conflictoSolicitud) {
            throw new BadRequestException(
                'Ya existe una solicitud pendiente o aprobada en ese horario',
            );
        }

        // 8. Verificar conflicto con reservas activas
        const conflictoReserva = await this.reservaRepo
            .createQueryBuilder('r')
            .where('r.id_centro = :c', { c: dto.id_centro })
            .andWhere('r.fecha_uso = :f', { f: dto.fecha_uso })
            .andWhere('r.estado = :e', { e: ReservaEstado.ACTIVA })
            .andWhere('r.hora_inicio < :fin AND r.hora_fin > :inicio', {
                inicio: dto.hora_inicio,
                fin: dto.hora_fin,
            })
            .getOne();

        if (conflictoReserva) {
            throw new BadRequestException('Ya existe una reserva activa en ese horario');
        }

        // 9. Verificar que el profesor no tenga otra solicitud/reserva en la misma fecha y hora
        const conflictoPropio = await this.solicitudRepo
            .createQueryBuilder('s')
            .where('s.id_usuario = :u', { u: user.id_usuario })
            .andWhere('s.fecha_uso = :f', { f: dto.fecha_uso })
            .andWhere('s.estado IN (:...estados)', { estados: ['pendiente', 'aprobada'] })
            .andWhere('s.hora_inicio < :fin AND s.hora_fin > :inicio', {
                inicio: dto.hora_inicio,
                fin: dto.hora_fin,
            })
            .getOne();

        if (conflictoPropio) {
            throw new BadRequestException(
                'Ya tienes una solicitud en ese horario. Cancela la anterior primero.',
            );
        }

        // Crear solicitud
        const solicitud = this.solicitudRepo.create({
            ...dto,
            id_usuario: user.id_usuario,
            estado: SolicitudEstado.PENDIENTE,
        });
        const saved = await this.solicitudRepo.save(solicitud);
        await this.historialSvc.log(user.id_usuario, 'CREAR_SOLICITUD', 'solicitud', saved.id_solicitud);
        return saved;
    }

    // ================================================================
    // APROBAR SOLICITUD (Admin)
    // ================================================================
    async approve(id: number, dto: ReviewSolicitudDto, admin: User): Promise<Reserva> {
        const s = await this.findOneWithRelations(id);

        if (s.estado !== SolicitudEstado.PENDIENTE)
            throw new BadRequestException('Solo se pueden aprobar solicitudes pendientes');

        // Verificar que el horario siga disponible al momento de aprobar
        const conflictoReserva = await this.reservaRepo
            .createQueryBuilder('r')
            .where('r.id_centro = :c', { c: s.id_centro })
            .andWhere('r.fecha_uso = :f', { f: s.fecha_uso })
            .andWhere('r.estado = :e', { e: ReservaEstado.ACTIVA })
            .andWhere('r.hora_inicio < :fin AND r.hora_fin > :inicio', {
                inicio: s.hora_inicio,
                fin: s.hora_fin,
            })
            .getOne();

        if (conflictoReserva) {
            throw new BadRequestException(
                'El horario ya fue reservado por otra solicitud. Rechaza esta solicitud.',
            );
        }

        await this.solicitudRepo.update(id, {
            estado: SolicitudEstado.APROBADA,
            id_admin_revisor: admin.id_usuario,
            fecha_revision: new Date(),
        });

        const reserva = this.reservaRepo.create({
            id_solicitud: s.id_solicitud,
            id_usuario: s.id_usuario,
            id_centro: s.id_centro,
            fecha_uso: s.fecha_uso,
            hora_inicio: s.hora_inicio,
            hora_fin: s.hora_fin,
        });
        const savedR = await this.reservaRepo.save(reserva);

        await this.notifSvc.create({
            id_usuario: s.id_usuario,
            tipo: NotificacionTipo.SOLICITUD_APROBADA,
            titulo: 'Solicitud aprobada',
            mensaje: `Tu solicitud para el ${s.fecha_uso} de ${s.hora_inicio} a ${s.hora_fin} fue aprobada.`,
            id_entidad_ref: savedR.id_reserva,
        });

        await this.historialSvc.log(admin.id_usuario, 'APROBAR_SOLICITUD', 'solicitud', id);
        return savedR;
    }

    // ================================================================
    // RECHAZAR SOLICITUD (Admin)
    // ================================================================
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
        return this.findOneWithRelations(id);
    }

    // ================================================================
    // CANCELAR SOLICITUD (Profesor)
    // ================================================================
    async cancel(id: number, user: User): Promise<Solicitud> {
        const s = await this.findOne(id);
        if (s.id_usuario !== user.id_usuario)
            throw new ForbiddenException('No puedes cancelar una solicitud de otro usuario');
        if (s.estado !== SolicitudEstado.PENDIENTE)
            throw new BadRequestException('Solo puedes cancelar solicitudes pendientes');

        await this.solicitudRepo.update(id, { estado: SolicitudEstado.CANCELADA });
        await this.historialSvc.log(user.id_usuario, 'CANCELAR_SOLICITUD', 'solicitud', id);
        return this.findOneWithRelations(id);
    }

    // ================================================================
    // DETALLE DE SOLICITUD
    // ================================================================
    async getDetail(id: number, user: User): Promise<Solicitud> {
        const s = await this.findOneWithRelations(id);
        if (user.rol !== 'admin' && s.id_usuario !== user.id_usuario) {
            throw new ForbiddenException('No tienes acceso a esta solicitud');
        }
        return s;
    }

    // ================================================================
    // LISTADOS CON PAGINACION
    // ================================================================
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
            qb.andWhere(
                '(u.nombre LIKE :b OR u.apellido1 LIKE :b OR s.materia LIKE :b OR s.grupo LIKE :b)',
                { b: `%${buscar}%` },
            );
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

    // ================================================================
    // HELPERS INTERNOS
    // ================================================================
    private async findOne(id: number): Promise<Solicitud> {
        const s = await this.solicitudRepo.findOne({ where: { id_solicitud: id } });
        if (!s) throw new NotFoundException(`Solicitud #${id} no encontrada`);
        return s;
    }

    private async findOneWithRelations(id: number): Promise<Solicitud> {
        const s = await this.solicitudRepo.findOne({
            where: { id_solicitud: id },
            relations: ['usuario'],
        });
        if (!s) throw new NotFoundException(`Solicitud #${id} no encontrada`);
        return s;
    }
}
