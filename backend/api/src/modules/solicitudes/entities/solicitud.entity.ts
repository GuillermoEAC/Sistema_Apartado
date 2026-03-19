import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SolicitudEstado {
    PENDIENTE = 'pendiente',
    APROBADA = 'aprobada',
    RECHAZADA = 'rechazada',
    CANCELADA = 'cancelada',
}

@Entity('solicitud')
export class Solicitud {
    @PrimaryGeneratedColumn()
    id_solicitud: number;

    @Column()
    id_usuario: number;

    @Column()
    id_centro: number;

    @Column({ type: 'date' })
    fecha_uso: string;

    @Column({ type: 'time' })
    hora_inicio: string;

    @Column({ type: 'time' })
    hora_fin: string;

    @Column({ length: 100 })
    materia: string;

    @Column({ length: 50 })
    grupo: string;

    @Column({ type: 'smallint' })
    num_alumnos: number;

    @Column({ type: 'text', nullable: true })
    proposito: string;

    @Column({ type: 'text', nullable: true })
    software_requerido: string;

    @Column({ type: 'enum', enum: SolicitudEstado, default: SolicitudEstado.PENDIENTE })
    estado: SolicitudEstado;

    @Column({ type: 'text', nullable: true })
    motivo_rechazo: string;

    @Column({ nullable: true })
    id_admin_revisor: number;

    @Column({ type: 'datetime', nullable: true })
    fecha_revision: Date;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
