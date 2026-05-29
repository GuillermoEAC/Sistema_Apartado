import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFacultadDto {
    @IsString()
    @MinLength(3)
    nombre: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}

export class UpdateFacultadDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    nombre?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
