import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Solicitud } from '../../solicitudes/entities/solicitud.entity';
import { CentroComputo } from '../../centros/entities/centro-computo.entity';

export enum ReservaEstado {
    ACTIVA = 'activa',
    CANCELADA = 'cancelada',
    REPROGRAMADA = 'reprogramada',
    COMPLETADA = 'completada',
}

@Entity('reserva')
export class Reserva {
    @PrimaryGeneratedColumn()
    id_reserva: number;

    @Column({ unique: true })
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

    @Column({ type: 'enum', enum: ReservaEstado, default: ReservaEstado.ACTIVA })
    estado: ReservaEstado;

    @Column({ type: 'boolean', nullable: true, default: null })
    asistencia: boolean;

    @Column({ type: 'datetime', nullable: true })
    fecha_asistencia: Date;

    @Column({ type: 'text', nullable: true })
    motivo_cancelacion: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;

    @ManyToOne(() => CentroComputo, { eager: true })
    @JoinColumn({ name: 'id_centro' })
    centro: CentroComputo;

    @ManyToOne(() => Solicitud)
    @JoinColumn({ name: 'id_solicitud' })
    solicitud: Solicitud;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
