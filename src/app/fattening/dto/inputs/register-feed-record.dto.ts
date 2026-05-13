import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class RegisterFeedRecordDto {
    @ApiProperty({ description: 'ID del lote al que se suministró el alimento', example: 3 })
    @IsInt()
    @IsPositive()
    idLot: number;

    @ApiProperty({ description: 'ID del usuario que registra (opcional, se toma del token si no se envía)', required: false, example: 1 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idUser?: number;

    @ApiProperty({ description: 'ID local UUID para idempotencia offline', required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ description: 'Fecha del suministro (ISO 8601 date)', example: '2027-03-15' })
    @IsDateString()
    feedDate: Date;

    @ApiProperty({ description: 'Tipo de alimento (texto libre: maíz, balanceado, heno, etc.)', example: 'Maíz molido', maxLength: 150 })
    @IsString()
    @MaxLength(150)
    feedType: string;

    @ApiProperty({ description: 'Cantidad suministrada', example: 250.5, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    quantity?: number;

    @ApiProperty({ description: 'Unidad de medida (kg, bolsas, fardos). Por defecto kg', example: 'kg', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    unit?: string;

    @ApiProperty({ description: 'Costo total del suministro', example: 1500.00, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    cost?: number;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Indica si fue registrado offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
