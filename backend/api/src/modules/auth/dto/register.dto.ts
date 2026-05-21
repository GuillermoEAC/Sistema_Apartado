import { IsEmail, IsOptional, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

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

    @IsNotEmpty({ message: 'El correo es requerido' })
    @IsEmail({}, { message: 'El formato del correo no es válido' })
    // 2. AGREGA ESTA REGLA EXACTA PARA EL DOMINIO DE LA UAS:
    @Matches(/^[a-zA-Z0-9._%+-]+@(ms\.uas\.edu\.mx|uas\.edu\.mx)$/i, {
        message: 'Registro denegado: Solo se permiten correos institucionales (@ms.uas.edu.mx o @uas.edu.mx)',
    })
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
