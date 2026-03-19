import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    findAll() {
        return this.repo.find({ order: { created_at: 'DESC' } });
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
