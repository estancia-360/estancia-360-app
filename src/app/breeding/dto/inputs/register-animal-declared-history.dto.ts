import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

/**
 * DTO de entrada para registrar el historial reproductivo declarado de un animal.
 * El historial declarado recoge información provista verbalmente por el productor
 * sobre partos previos al ingreso del animal al sistema.
 * Solo puede existir un historial declarado por animal (relación 1:1).
 */
export class RegisterAnimalDeclaredHistoryDto {
    @ApiProperty({
        description: 'ID del animal al que se le registra el historial declarado',
        example: 10,
    })
    @IsInt({ message: 'El ID del animal debe ser un número entero' })
    @IsPositive({ message: 'El ID del animal debe ser positivo' })
    idRanchAnimal: number;

    @ApiProperty({
        description: 'Cantidad de partos previos al ingreso al sistema, declarados por el productor',
        required: false,
        example: 3,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'La cantidad de partos previos debe ser un número entero' })
    @Min(0, { message: 'La cantidad de partos previos no puede ser negativa' })
    @Max(30, { message: 'La cantidad de partos previos no puede superar 30' })
    prevBirthsCount?: number;

    @ApiProperty({
        description: 'Año del último parto previo al ingreso al sistema',
        required: false,
        example: 2024,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El año del último parto debe ser un número entero' })
    @Min(2000, { message: 'El año no puede ser anterior a 2000' })
    @Max(2100, { message: 'El año no puede ser posterior a 2100' })
    prevLastBirthYear?: number;

    @ApiProperty({
        description: 'Promedio de peso al destete de crías previas (kg), declarado por el productor',
        required: false,
        example: 115.5,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso promedio debe ser un número con hasta 2 decimales' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    prevAvgWeaningWeight?: number;

    @ApiProperty({
        description: 'Observaciones adicionales del historial declarado',
        required: false,
        example: 'Animal comprado con historial verbal del vendedor',
    })
    @IsOptional()
    @IsString({ message: 'Las notas deben ser texto' })
    @IsNotEmpty({ message: 'Las notas no pueden estar vacías si se envían' })
    @MaxLength(500, { message: 'Las notas no pueden superar 500 caracteres' })
    notes?: string;
}
