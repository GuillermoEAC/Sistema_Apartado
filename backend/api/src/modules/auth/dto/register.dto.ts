import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(2)
    nombre: string;

    @IsString()
    @MinLength(2)
    apellido1: string;

    @IsOptional()
    @IsString()
    apellido2?: string;

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsString()
    facultad?: string;
}
