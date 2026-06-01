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
            .leftJoin('reserva', 'r', 'r.id_usuario = u.id_usuario')
            .addSelect('COUNT(r.id_reserva)', 'reservation_count')
            .groupBy('u.id_usuario')
            .orderBy('u.created_at', 'DESC');

        if (buscar) {
            qb.andWhere('(u.nombre LIKE :b OR u.apellido1 LIKE :b OR u.correo LIKE :b)', { b: `%${buscar}%` });
        }

        return qb
            .skip((page - 1) * limit)
            .take(limit)
            .getRawAndEntities()
            .then(async ({ entities, raw }) => {
                const totalQb = this.repo.createQueryBuilder('u');
                if (buscar) {
                    totalQb.andWhere('(u.nombre LIKE :b OR u.apellido1 LIKE :b OR u.correo LIKE :b)', { b: `%${buscar}%` });
                }
                const total = await totalQb.getCount();

                const data = entities.map((user, index) => ({
                    ...user,
                    reservation_count: Number(raw[index]?.reservation_count ?? 0),
                    admin_view: {
                        id: String(user.id_usuario),
                        name: `${user.nombre} ${user.apellido1}${user.apellido2 ? ` ${user.apellido2}` : ''}`,
                        email: user.correo,
                        faculty: user.facultad ?? 'Sin facultad',
                        active: user.activo,
                        reservationCount: Number(raw[index]?.reservation_count ?? 0),
                        joinedDate: user.created_at,
                    },
                }));

                return {
                    data,
                    total,
                    page,
                    limit,
                totalPages: Math.ceil(total / limit),
                };
            });
    }

    async findById(id: number): Promise<User> {
        const user = await this.repo.findOne({ where: { id_usuario: id } });
        if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
        return user;
    }

    async findByEmail(correo: string): Promise<User | null> {
        return this.repo
            .createQueryBuilder('u')
            .addSelect('u.password_hash')
            .where('LOWER(u.correo) = LOWER(:correo)', { correo: correo.trim() })
            .getOne();
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
        const correo = data.correo.trim().toLowerCase();
        const existing = await this.findByEmail(correo);
        if (existing) throw new BadRequestException('El correo ya está registrado');

        const hash = await bcrypt.hash(data.password, 10);
        const user = this.repo.create({
            ...data,
            correo,
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

    async deactivate(id: number) {
        const user = await this.findById(id);
        if (user.rol === UserRole.ADMIN) {
            throw new BadRequestException('No se puede eliminar una cuenta administradora');
        }

        await this.repo.update(id, { activo: false });
        return {
            id_usuario: id,
            message: 'Usuario eliminado correctamente',
        };
    }

    async updatePassword(id: number, newPassword: string) {
        const hash = await bcrypt.hash(newPassword, 10);
        await this.repo.update(id, { password_hash: hash });
        return { message: 'Contraseña actualizada' };
    }
}
