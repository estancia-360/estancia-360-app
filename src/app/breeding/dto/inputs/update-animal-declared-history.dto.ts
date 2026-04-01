import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * DTO para actualizar el historial reproductivo declarado de un animal.
 * Todos los campos son opcionales — solo se actualiza lo que se envía.
 * No se puede cambiar el animal vinculado.
 */
export class UpdateAnimalDeclaredHistoryDto {
    @ApiProperty({
        description: 'Cantidad de partos previos declarados',
        required: false,
        example: 4,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(30)
    prevBirthsCount?: number;

    @ApiProperty({
        description: 'Año del último parto previo al ingreso al sistema',
        required: false,
        example: 2023,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    prevLastBirthYear?: number;

    @ApiProperty({
        description: 'Promedio de peso al destete de crías previas (kg)',
        required: false,
        example: 118.0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    prevAvgWeaningWeight?: number;

    @ApiProperty({
        description: 'Observaciones adicionales del historial declarado',
        required: false,
        example: 'Se corrigió el conteo de partos tras consulta con el vendedor',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    notes?: string;
}
