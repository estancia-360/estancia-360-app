import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class RegisterFeedRecordDto {
    @ApiProperty({ description: 'ID of the lot fed', example: 3 })
    @IsInt()
    @IsPositive()
    idLot: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ example: '2027-03-15' })
    @IsDateString()
    feedDate: Date;

    @ApiProperty({ description: 'Free-text feed type (corn, balanced feed, hay, etc.)', example: 'Maíz molido', maxLength: 150 })
    @IsString()
    @MaxLength(150)
    feedType: string;

    @ApiProperty({ required: false, example: 250.5 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    quantity?: number;

    @ApiProperty({ description: 'Unit (kg, bags, bales). Defaults to kg.', required: false, example: 'kg' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    unit?: string;

    @ApiProperty({ required: false, example: 1500.0 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    cost?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
