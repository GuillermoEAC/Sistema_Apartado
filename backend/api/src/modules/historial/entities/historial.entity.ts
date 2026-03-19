import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('historial')
export class Historial {
    @PrimaryGeneratedColumn()
    id_historial: number;

    @Column({ nullable: true })
    id_usuario: number;

    @Column({ length: 100 })
    accion: string;

    @Column({ length: 50 })
    entidad: string;

    @Column()
    id_entidad: number;

    @Column({ type: 'text', nullable: true })
    detalle: string;

    @Column({ length: 45, nullable: true })
    ip_address: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;

    @CreateDateColumn()
    created_at: Date;
}
