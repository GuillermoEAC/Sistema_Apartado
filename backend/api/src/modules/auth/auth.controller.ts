import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    getProfile(@Request() req) {
        const { password_hash, ...user } = req.user;
        return user;
    }
}
