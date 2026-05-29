import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFacultadDto, UpdateFacultadDto } from './dto/facultad.dto';
import { Facultad } from './entities/facultad.entity';

@Injectable()
export class FacultadesService {
    constructor(
        @InjectRepository(Facultad)
        private readonly repo: Repository<Facultad>,
    ) { }

    findActive() {
        return this.repo.find({
            where: { activo: true },
            order: { nombre: 'ASC' },
        });
    }

    findAll() {
        return this.repo.find({ order: { nombre: 'ASC' } });
    }

    async findOne(id: number): Promise<Facultad> {
        const facultad = await this.repo.findOne({ where: { id_facultad: id } });
        if (!facultad) throw new NotFoundException(`Facultad #${id} no encontrada`);
        return facultad;
    }

    async create(dto: CreateFacultadDto) {
        await this.ensureUniqueName(dto.nombre);
        return this.repo.save(this.repo.create({
            nombre: dto.nombre.trim(),
            activo: dto.activo ?? true,
        }));
    }

    async update(id: number, dto: UpdateFacultadDto) {
        const facultad = await this.findOne(id);
        if (dto.nombre && dto.nombre.trim() !== facultad.nombre) {
            await this.ensureUniqueName(dto.nombre);
        }

        await this.repo.update(id, {
            ...dto,
            nombre: dto.nombre?.trim(),
        });
        return this.findOne(id);
    }

    async toggleActive(id: number) {
        const facultad = await this.findOne(id);
        await this.repo.update(id, { activo: !facultad.activo });
        return this.findOne(id);
    }

    private async ensureUniqueName(nombre: string) {
        const existing = await this.repo.findOne({ where: { nombre: nombre.trim() } });
        if (existing) throw new BadRequestException('La facultad ya existe');
    }
}
