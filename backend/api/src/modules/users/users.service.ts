import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    findAll(page = 1, limit = 20, buscar?: string) {
        const qb = this.repo.createQueryBuilder('u')
            .orderBy('u.created_at', 'DESC');

        if (buscar) {
            qb.andWhere('(u.nombre LIKE :b OR u.apellido1 LIKE :b OR u.correo LIKE :b)', { b: `%${buscar}%` });
        }

        return qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
            .then(([data, total]) => ({
                data, total, page, limit,
                totalPages: Math.ceil(total / limit),
            }));
    }

    async findById(id: number): Promise<User> {
        const user = await this.repo.findOne({ where: { id_usuario: id } });
        if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
        return user;
    }

    async findByEmail(correo: string): Promise<User | null> {
        return this.repo.findOne({ where: { correo } });
    }

    async create(data: {
        nombre: string;
        apellido1: string;
        apellido2?: string;
        correo: string;
        password: string;
        telefono?: string;
        facultad?: string;
        rol?: UserRole;
    }) {
        const existing = await this.findByEmail(data.correo);
        if (existing) throw new BadRequestException('El correo ya está registrado');

        const hash = await bcrypt.hash(data.password, 10);
        const user = this.repo.create({
            ...data,
            password_hash: hash,
            rol: data.rol ?? UserRole.PROFESOR,
        });
        return this.repo.save(user);
    }

    async toggleActive(id: number) {
        const user = await this.findById(id);
        await this.repo.update(id, { activo: !user.activo });
        return { message: `Usuario ${!user.activo ? 'activado' : 'desactivado'}` };
    }

    async updatePassword(id: number, newPassword: string) {
        const hash = await bcrypt.hash(newPassword, 10);
        await this.repo.update(id, { password_hash: hash });
        return { message: 'Contraseña actualizada' };
    }
}
