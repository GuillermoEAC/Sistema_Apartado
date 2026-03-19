import {
    IsDateString, IsInt, IsString, Min, Max, IsOptional, Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSolicitudDto {
    @ApiProperty({ example: 1, description: 'ID de la sala de cómputo' })
    @IsInt()
    id_centro: number;

    @ApiProperty({ example: '2024-04-15' })
    @IsDateString()
    fecha_uso: string;

    @ApiProperty({ example: '08:00' })
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'Formato HH:mm' })
    hora_inicio: string;

    @ApiProperty({ example: '10:00' })
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'Formato HH:mm' })
    hora_fin: string;

    @ApiProperty({ example: 'Programación I' })
    @IsString()
    materia: string;

    @ApiProperty({ example: '3A' })
    @IsString()
    grupo: string;

    @ApiProperty({ example: 25 })
    @IsInt()
    @Min(1)
    @Max(60)
    num_alumnos: number;

    @IsOptional()
    @IsString()
    proposito?: string;

    @IsOptional()
    @IsString()
    software_requerido?: string;
}

export class ReviewSolicitudDto {
    @IsOptional()
    @IsString()
    motivo?: string;
}
