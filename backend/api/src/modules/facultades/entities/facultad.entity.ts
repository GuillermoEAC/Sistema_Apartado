import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('facultad')
export class Facultad {
    @PrimaryGeneratedColumn()
    id_facultad: number;

    @Column({ length: 120, unique: true })
    nombre: string;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    created_at: Date;
}
