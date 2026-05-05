import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateCentroComputoDto {
    @IsString()
    @MinLength(3)
    nombre: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    capacidad: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}

export class UpdateCentroComputoDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    nombre?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    capacidad?: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
