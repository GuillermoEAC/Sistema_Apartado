import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('centro_computo')
export class CentroComputo {
    @PrimaryGeneratedColumn()
    id_centro: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ type: 'smallint', default: 30 })
    capacidad: number;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    created_at: Date;
}
