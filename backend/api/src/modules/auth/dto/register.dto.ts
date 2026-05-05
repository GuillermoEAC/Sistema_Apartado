import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(2)
    nombre: string;

    @IsString()
    @MinLength(2)
    apellido1: string;

    @IsString()
    apellido2?: string;

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    password: string;
}
