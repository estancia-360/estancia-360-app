import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { WeightTypeEnum } from 'src/modules/rearing-modules/weight-records/entities/weight-record.entity';

export class RegisterWeightRecordDto {
    @ApiProperty({ description: 'ID del animal (debe estar en Recría ps=2)', example: 5 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID del lote actual del animal', example: 3 })
    @IsInt()
    @IsPositive()
    idLot: number;

    @ApiProperty({ description: 'ID local UUID para idempotencia offline', required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ description: 'Peso en kilogramos', example: 185.5 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    weight: number;

    @ApiProperty({ description: 'Tipo de medición', enum: WeightTypeEnum, example: WeightTypeEnum.SCALE })
    @IsEnum(WeightTypeEnum)
    weightType: WeightTypeEnum;

    @ApiProperty({ description: 'Condición corporal (1=muy malo, 5=excelente)', minimum: 1, maximum: 5, required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    bodyCondition?: number;

    @ApiProperty({ description: 'Edad del animal en días al momento del pesaje', required: false, example: 180 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    ageDays?: number;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Fecha y hora del pesaje (ISO 8601)', example: '2026-05-10T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ description: 'Indica si el evento fue registrado offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
