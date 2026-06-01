import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentroComputo } from './entities/centro-computo.entity';
import { CreateCentroComputoDto, UpdateCentroComputoDto } from './dto/centro-computo.dto';
import { Facultad } from '../facultades/entities/facultad.entity';

@Injectable()
export class CentrosService {
    constructor(
        @InjectRepository(CentroComputo)
        private readonly repo: Repository<CentroComputo>,
        @InjectRepository(Facultad)
        private readonly facultadRepo: Repository<Facultad>,
    ) { }

    findActive(facultad?: string) {
        const qb = this.repo.createQueryBuilder('c')
            .leftJoinAndSelect('c.facultad', 'f')
            .where('c.activo = :activo', { activo: true })
            .orderBy('c.nombre', 'ASC');

        if (facultad) {
            qb.andWhere('(f.nombre = :facultad OR c.es_general = true)', { facultad });
        }

        return qb.getMany();
    }

    findAll() {
        return this.repo.find({ order: { nombre: 'ASC' } });
    }

    async findOne(id: number): Promise<CentroComputo> {
        const centro = await this.repo.findOne({ where: { id_centro: id } });
        if (!centro) throw new NotFoundException(`Centro de cómputo #${id} no encontrado`);
        return centro;
    }

    async create(dto: CreateCentroComputoDto) {
        await this.ensureFaculty(dto.id_facultad);
        const centro = this.repo.create({
            ...dto,
            activo: dto.activo ?? true,
            es_general: dto.es_general ?? false,
        });
        return this.repo.save(centro);
    }

    async update(id: number, dto: UpdateCentroComputoDto) {
        await this.findOne(id);
        if (dto.id_facultad) {
            await this.ensureFaculty(dto.id_facultad);
        }
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async toggleActive(id: number) {
        const centro = await this.findOne(id);
        await this.repo.update(id, { activo: !centro.activo });
        return this.findOne(id);
    }

    private async ensureFaculty(id_facultad: number) {
        const facultad = await this.facultadRepo.findOne({
            where: { id_facultad, activo: true },
        });
        if (!facultad) {
            throw new BadRequestException('La facultad no existe o no esta disponible');
        }
    }
}
