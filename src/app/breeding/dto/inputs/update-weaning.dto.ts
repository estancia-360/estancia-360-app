import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO para actualizar un destete.
 * Todos los campos son opcionales — solo se actualiza lo que se envía.
 * No se puede cambiar el evento vinculado.
 */
export class UpdateWeaningDto {
    @ApiProperty({
        description: 'Peso de la cría al momento del destete (kg)',
        required: false,
        example: 125.5,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weaningWeight?: number;

    @ApiProperty({
        description: 'Edad de la cría en días al momento del destete',
        required: false,
        example: 185,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    ageDays?: number;
}
