import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateFeedRecordDto {
    @ApiProperty({ required: false, example: 'Balanceado' })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    feedType?: string;

    @ApiProperty({ required: false, example: 300.0 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    quantity?: number;

    @ApiProperty({ required: false, example: 'kg' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    unit?: string;

    @ApiProperty({ required: false, example: 1800.0 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    cost?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
