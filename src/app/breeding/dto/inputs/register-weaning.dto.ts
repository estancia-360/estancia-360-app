import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class RegisterWeaningDto {
    @ApiProperty({ description: 'ID del animal cría a destetar', example: 20 })
    @IsInt({ message: 'El id de la cría debe ser un número entero' })
    @IsPositive({ message: 'El id de la cría debe ser positivo' })
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID del lote de recría destino', example: 3 })
    @IsInt({ message: 'El id del lote destino debe ser un número entero' })
    @IsPositive({ message: 'El id del lote destino debe ser positivo' })
    idLotDest: number;

    @ApiProperty({ description: 'Peso de la cría al momento del destete (kg)', required: false, example: 120.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso al destete debe ser un número con hasta 2 decimales' })
    @Min(0)
    weaningWeight?: number;

    @ApiProperty({ description: 'Edad de la cría en días al momento del destete', required: false, example: 180 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'La edad en días debe ser un número entero' })
    @Min(1)
    @Max(730)
    weaningAge?: number;

    @ApiProperty({ description: 'Notas adicionales del destete', required: false })
    @IsOptional()
    notes?: string;

    @ApiProperty({ description: 'Fecha y hora del destete (ISO 8601)', example: '2026-11-10T08:00:00.000Z' })
    @IsDateString({}, { message: 'La fecha del destete debe tener formato ISO 8601 válido' })
    eventDate: Date;

    @ApiProperty({ description: 'Indica si el evento fue generado offline y se está sincronizando.', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
