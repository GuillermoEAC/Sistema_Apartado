import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'profesor@institucion.edu.mx' })
    @IsEmail({}, { message: 'Correo institucional inválido' })
    correo: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @MinLength(6)
    password: string;
}
