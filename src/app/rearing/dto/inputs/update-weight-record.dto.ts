import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { WeightTypeEnum } from 'src/modules/rearing-modules/weight-records/entities/weight-record.entity';

export class UpdateWeightRecordDto {
    @ApiProperty({ description: 'Peso en kilogramos', required: false, example: 185.5 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    weight?: number;

    @ApiProperty({ description: 'Tipo de medición', enum: WeightTypeEnum, required: false })
    @IsOptional()
    @IsEnum(WeightTypeEnum)
    weightType?: WeightTypeEnum;

    @ApiProperty({ description: 'Condición corporal (1-5)', required: false, minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    bodyCondition?: number;

    @ApiProperty({ description: 'Edad del animal en días', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    ageDays?: number;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
