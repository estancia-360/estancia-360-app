import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { WeightTypeEnum } from 'src/modules/rearing-modules/weight-records/entities/weight-record.entity';

export class UpdateWeightRecordDto {
    @ApiProperty({ required: false, example: 185.5 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    weight?: number;

    @ApiProperty({ enum: WeightTypeEnum, required: false })
    @IsOptional()
    @IsEnum(WeightTypeEnum)
    weightType?: WeightTypeEnum;

    @ApiProperty({ required: false, minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    bodyCondition?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    ageDays?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
