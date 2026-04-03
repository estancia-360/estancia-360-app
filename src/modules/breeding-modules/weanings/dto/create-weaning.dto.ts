import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class CreateWeaningDto {
    @ApiProperty({ description: 'ID del evento animal al que pertenece este destete', example: 8 })
    @IsInt({ message: 'El id del evento debe ser un número entero' })
    @IsPositive({ message: 'El id del evento debe ser positivo' })
    idEvent: number;

    @ApiProperty({ description: 'ID de la cría a destetar', example: 5 })
    @IsInt({ message: 'El id de la cría debe ser un número entero' })
    @IsPositive({ message: 'El id de la cría debe ser positivo' })
    idCria: number;

    @ApiProperty({ description: 'ID del lote de recría destino', example: 3 })
    @IsInt({ message: 'El id del lote destino debe ser un número entero' })
    @IsPositive({ message: 'El id del lote destino debe ser positivo' })
    idLotDest: number;

    @ApiProperty({ description: 'Peso de la cría al destete en kg', required: false, example: 120.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso al destete debe ser un número con hasta 2 decimales' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    weaningWeight?: number;

    @ApiProperty({ description: 'Edad en días de la cría al momento del destete', required: false, example: 180 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'La edad en días debe ser un número entero' })
    @Min(1, { message: 'La edad debe ser mayor a 0' })
    @Max(730, { message: 'La edad no puede superar 730 días' })
    weaningAge?: number;
}
