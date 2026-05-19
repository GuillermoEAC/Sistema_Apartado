import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from '../reservas/entities/reserva.entity';
import { BloqueoHorario } from '../bloqueos/entities/bloqueo.entity';

@Injectable()
export class CalendarioService {
    constructor(
        @InjectRepository(Reserva) private reservaRepo: Repository<Reserva>,
        @InjectRepository(BloqueoHorario) private bloqueoRepo: Repository<BloqueoHorario>,
    ) { }

    async getEventos(userRol?: string, userId?: number) {
        const reservas = await this.reservaRepo.find({
            where: { estado: 'activa' as any },
            relations: ['usuario'],
        });

        const bloqueos = await this.bloqueoRepo.find();

        const eventosReserva = reservas.map((r) => {
            const base = {
                id: `reserva-${r.id_reserva}`,
                start: `${r.fecha_uso}T${r.hora_inicio}`,
                end: `${r.fecha_uso}T${r.hora_fin}`,
                status: 'approved',
                color: '#22c55e',
                backgroundColor: '#22c55e',
            };

            // Datos sensibles solo para admin o el propio profesor
            if (userRol === 'admin' || r.id_usuario === userId) {
                return {
                    ...base,
                    title: r.usuario
                        ? `${r.usuario.nombre} ${r.usuario.apellido1}`
                        : 'Reservado',
                    extendedProps: {
                        profesor: r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido1}` : null,
                        id_usuario: r.id_usuario,
                        id_centro: r.id_centro,
                    },
                };
            }

            // Vista pública: sin datos personales
            return { ...base, title: 'Ocupado' };
        });

        const eventosBloqueo = bloqueos.map((b) => ({
            id: `bloqueo-${b.id_bloqueo}`,
            title: b.motivo,
            start: this.formatDateTime(b.fecha_inicio),
            end: this.formatDateTime(b.fecha_fin),
            status: 'blocked',
            color: '#ef4444',
            backgroundColor: '#ef4444',
        }));

        return [...eventosReserva, ...eventosBloqueo];
    }

    private formatDateTime(value: Date) {
        const pad = (part: number) => String(part).padStart(2, '0');

        return [
            value.getFullYear(),
            pad(value.getMonth() + 1),
            pad(value.getDate()),
        ].join('-')
            + 'T'
            + [
                pad(value.getHours()),
                pad(value.getMinutes()),
                pad(value.getSeconds()),
            ].join(':');
    }
}
