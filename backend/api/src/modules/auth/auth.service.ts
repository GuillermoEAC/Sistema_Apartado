import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.correo);

        if (!user || !user.activo) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const passwordMatch = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { sub: user.id_usuario, email: user.correo, rol: user.rol };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id_usuario,
                nombre: `${user.nombre} ${user.apellido1}`,
                correo: user.correo,
                rol: user.rol,
            },
        };
    }
}
