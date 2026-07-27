import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateRanchAnimalDto {
    @ApiProperty({ description: 'ID of the ranch the animal belongs to', example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ description: "Mother's code", example: 'VAC-002', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    codeMother?: string;

    @ApiProperty({ description: "Father's code", example: 'VAC-003', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    codeFather?: string;

    @ApiProperty({ description: 'Breed ID', example: 3 })
    @IsInt()
    @IsPositive()
    idBreed: number;

    @ApiProperty({ description: 'Animal status ID', example: 1 })
    @IsInt()
    @IsPositive()
    idStatus: number;

    @ApiProperty({ description: 'Animal class ID', example: 1 })
    @IsInt()
    @IsPositive()
    idAnimalClass: number;

    @ApiProperty({ description: 'Lot ID', example: 1, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idLot?: number;

    @ApiProperty({ description: 'Productive status ID', example: 1, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idProductiveStatus?: number;

    @ApiProperty({ description: 'Unique animal code (tag/caravana)', example: 'VAC-001' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @ApiProperty({ example: '2022-05-10' })
    @IsDateString()
    birthdate: Date;

    @ApiProperty({ example: 350.75, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weight?: number;

    @ApiProperty({ enum: ['F', 'M'], example: 'F' })
    @IsString()
    @IsIn(['F', 'M'])
    sex: 'F' | 'M';

    @ApiProperty({ description: 'When the animal was registered on the device (ISO 8601)', example: '2026-01-24T10:30:00.000Z' })
    @IsDateString()
    createdAt: Date;
}
