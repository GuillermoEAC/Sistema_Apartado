import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { BloqueoHorario } from '../bloqueos/entities/bloqueo.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Solicitud) private solicitudRepo: Repository<Solicitud>,
        @InjectRepository(Reserva) private reservaRepo: Repository<Reserva>,
        @InjectRepository(BloqueoHorario) private bloqueoRepo: Repository<BloqueoHorario>,
    ) { }

    async getAdminStats() {
        const hoy = new Date().toISOString().split('T')[0];

        const [
            solicitudesPendientes,
            solicitudesHoy,
            reservasHoy,
            reservasActivas,
            bloqueos,
            usuariosActivos,
            totalUsuarios,
        ] = await Promise.all([
            this.solicitudRepo.count({ where: { estado: 'pendiente' as any } }),
            this.solicitudRepo.count({ where: { fecha_uso: hoy } }),
            this.reservaRepo.count({ where: { fecha_uso: hoy, estado: 'activa' as any } }),
            this.reservaRepo.count({ where: { estado: 'activa' as any } }),
            this.bloqueoRepo.count(),
            this.userRepo.count({ where: { activo: true } }),
            this.userRepo.count(),
        ]);

        const solicitudesPorEstado = await this.solicitudRepo
            .createQueryBuilder('s')
            .select('s.estado', 'estado')
            .addSelect('COUNT(*)', 'total')
            .groupBy('s.estado')
            .getRawMany();

        const reservasPorEstado = await this.reservaRepo
            .createQueryBuilder('r')
            .select('r.estado', 'estado')
            .addSelect('COUNT(*)', 'total')
            .groupBy('r.estado')
            .getRawMany();

        return {
            solicitudes_pendientes: solicitudesPendientes,
            solicitudes_hoy: solicitudesHoy,
            reservas_hoy: reservasHoy,
            reservas_activas: reservasActivas,
            bloqueos_activos: bloqueos,
            usuarios_activos: usuariosActivos,
            total_usuarios: totalUsuarios,
            solicitudes_por_estado: solicitudesPorEstado,
            reservas_por_estado: reservasPorEstado,
        };
    }

    async getProfesorStats(userId: number) {
        const [
            misSolicitudesPendientes,
            misReservasActivas,
            misSolicitudesTotal,
            misReservasTotal,
        ] = await Promise.all([
            this.solicitudRepo.count({ where: { id_usuario: userId, estado: 'pendiente' as any } }),
            this.reservaRepo.count({ where: { id_usuario: userId, estado: 'activa' as any } }),
            this.solicitudRepo.count({ where: { id_usuario: userId } }),
            this.reservaRepo.count({ where: { id_usuario: userId } }),
        ]);

        return {
            solicitudes_pendientes: misSolicitudesPendientes,
            reservas_activas: misReservasActivas,
            total_solicitudes: misSolicitudesTotal,
            total_reservas: misReservasTotal,
        };
    }
}
