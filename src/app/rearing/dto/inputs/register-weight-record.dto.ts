import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { WeightTypeEnum } from 'src/modules/rearing-modules/weight-records/entities/weight-record.entity';

export class RegisterWeightRecordDto {
    @ApiProperty({ description: 'ID of the animal (must be in Recría or Engorde)', example: 5 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: "ID of the animal's current lot", example: 3 })
    @IsInt()
    @IsPositive()
    idLot: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ example: 185.5 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    weight: number;

    @ApiProperty({ enum: WeightTypeEnum, example: WeightTypeEnum.SCALE })
    @IsEnum(WeightTypeEnum)
    weightType: WeightTypeEnum;

    @ApiProperty({ description: '1=very poor, 5=excellent', minimum: 1, maximum: 5, required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    bodyCondition?: number;

    @ApiProperty({ required: false, example: 180 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    ageDays?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: '2026-05-10T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
