import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('bloqueo_horario')
export class BloqueoHorario {
    @PrimaryGeneratedColumn()
    id_bloqueo: number;

    @Column()
    id_centro: number;

    @Column()
    id_admin: number;

    @Column({ type: 'datetime' })
    fecha_inicio: Date;

    @Column({ type: 'datetime' })
    fecha_fin: Date;

    @Column({ length: 255 })
    motivo: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_admin' })
    admin: User;

    @CreateDateColumn()
    created_at: Date;
}
