import {
    Injectable, BadRequestException, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, ReservaEstado } from './entities/reserva.entity';
import { HistorialService } from '../historial/historial.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotificacionTipo } from '../notificaciones/entities/notificacion.entity';
import { User } from '../users/entities/user.entity';
import { IsString, IsOptional, Matches, IsDateString, IsBoolean } from 'class-validator';

export class RescheduleDto {
    @IsDateString() nueva_fecha: string;
    @IsString() @Matches(/^\d{2}:\d{2}$/) nueva_hora_inicio: string;
    @IsString() @Matches(/^\d{2}:\d{2}$/) nueva_hora_fin: string;
}

export class AttendanceDto {
    @IsBoolean() asistencia: boolean;
}

@Injectable()
export class ReservasService {
    constructor(
        @InjectRepository(Reserva) private repo: Repository<Reserva>,
        private historialSvc: HistorialService,
        private notifSvc: NotificacionesService,
    ) { }

    findAllForUser(id_usuario: number) {
        return this.repo.find({ where: { id_usuario }, order: { fecha_uso: 'DESC' } });
    }

    findAll() {
        return this.repo.find({ order: { fecha_uso: 'DESC' } });
    }

    async findOne(id: number): Promise<Reserva> {
        const r = await this.repo.findOne({ where: { id_reserva: id } });
        if (!r) throw new NotFoundException(`Reserva #${id} no encontrada`);
        return r;
    }

    async cancel(id: number, user: User, motivo?: string): Promise<Reserva> {
        const r = await this.findOne(id);

        if (user.rol !== 'admin' && r.id_usuario !== user.id_usuario)
            throw new ForbiddenException('No puedes cancelar una reserva de otro usuario');
        if (r.estado !== ReservaEstado.ACTIVA)
            throw new BadRequestException('Solo puedes cancelar reservas activas');

        await this.repo.update(id, {
            estado: ReservaEstado.CANCELADA,
            motivo_cancelacion: motivo ?? 'Cancelada por el usuario',
        });

        if (user.rol === 'admin' && r.id_usuario !== user.id_usuario) {
            await this.notifSvc.create({
                id_usuario: r.id_usuario,
                tipo: NotificacionTipo.RESERVA_CANCELADA,
                titulo: 'Tu reserva fue cancelada',
                mensaje: motivo ?? 'El administrador canceló tu reserva',
                id_entidad_ref: id,
            });
        }

        await this.historialSvc.log(user.id_usuario, 'CANCELAR_RESERVA', 'reserva', id);
        return this.findOne(id);
    }

    async reschedule(id: number, dto: RescheduleDto, user: User): Promise<Reserva> {
        const r = await this.findOne(id);
        if (r.id_usuario !== user.id_usuario)
            throw new ForbiddenException('No puedes reprogramar una reserva de otro usuario');
        if (r.estado !== ReservaEstado.ACTIVA)
            throw new BadRequestException('Solo puedes reprogramar reservas activas');

        const conflicto = await this.repo
            .createQueryBuilder('r')
            .where('r.id_centro = :c', { c: r.id_centro })
            .andWhere('r.fecha_uso = :f', { f: dto.nueva_fecha })
            .andWhere('r.estado = :e', { e: 'activa' })
            .andWhere('r.hora_inicio < :fin AND r.hora_fin > :inicio', {
                inicio: dto.nueva_hora_inicio,
                fin: dto.nueva_hora_fin,
            })
            .andWhere('r.id_reserva != :id', { id })
            .getOne();

        if (conflicto)
            throw new BadRequestException('El nuevo horario no está disponible');

        await this.repo.update(id, {
            fecha_uso: dto.nueva_fecha,
            hora_inicio: dto.nueva_hora_inicio,
            hora_fin: dto.nueva_hora_fin,
            estado: ReservaEstado.ACTIVA,
        });

        await this.historialSvc.log(user.id_usuario, 'REPROGRAMAR_RESERVA', 'reserva', id);
        return this.findOne(id);
    }

    async confirmAttendance(id: number, dto: AttendanceDto, user: User) {
        const r = await this.findOne(id);
        if (r.id_usuario !== user.id_usuario)
            throw new ForbiddenException('No puedes confirmar asistencia de otra reserva');
        if (r.estado !== ReservaEstado.ACTIVA)
            throw new BadRequestException('Solo puedes confirmar asistencia en reservas activas');

        await this.repo.update(id, {
            asistencia: dto.asistencia,
            fecha_asistencia: new Date(),
            estado: ReservaEstado.COMPLETADA,
        });

        await this.historialSvc.log(
            user.id_usuario,
            dto.asistencia ? 'CONFIRMAR_ASISTENCIA' : 'REPORTAR_INASISTENCIA',
            'reserva',
            id,
        );
        return { message: 'Asistencia registrada correctamente' };
    }
}
