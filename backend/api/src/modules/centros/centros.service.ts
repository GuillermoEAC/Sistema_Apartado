import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentroComputo } from './entities/centro-computo.entity';
import { CreateCentroComputoDto, UpdateCentroComputoDto } from './dto/centro-computo.dto';

@Injectable()
export class CentrosService {
    constructor(
        @InjectRepository(CentroComputo)
        private readonly repo: Repository<CentroComputo>,
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

    async findOne(id: number): Promise<CentroComputo> {
        const centro = await this.repo.findOne({ where: { id_centro: id } });
        if (!centro) throw new NotFoundException(`Centro de cómputo #${id} no encontrado`);
        return centro;
    }

    create(dto: CreateCentroComputoDto) {
        const centro = this.repo.create({
            ...dto,
            activo: dto.activo ?? true,
        });
        return this.repo.save(centro);
    }

    async update(id: number, dto: UpdateCentroComputoDto) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async toggleActive(id: number) {
        const centro = await this.findOne(id);
        await this.repo.update(id, { activo: !centro.activo });
        return this.findOne(id);
    }
}
