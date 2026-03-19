import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificacionTipo {
    SOLICITUD_APROBADA = 'solicitud_aprobada',
    SOLICITUD_RECHAZADA = 'solicitud_rechazada',
    RESERVA_CANCELADA = 'reserva_cancelada',
    RECORDATORIO = 'recordatorio',
    GENERAL = 'general',
}

@Entity('notificacion')
export class Notificacion {
    @PrimaryGeneratedColumn()
    id_notificacion: number;

    @Column()
    id_usuario: number;

    @Column({ type: 'enum', enum: NotificacionTipo, default: NotificacionTipo.GENERAL })
    tipo: NotificacionTipo;

    @Column({ length: 150 })
    titulo: string;

    @Column({ type: 'text' })
    mensaje: string;

    @Column({ default: false })
    leida: boolean;

    @Column({ nullable: true })
    id_entidad_ref: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;

    @CreateDateColumn()
    created_at: Date;
}
