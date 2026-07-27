import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';

export class RegisterAnimalDeclaredHistoryDto {
    @ApiProperty({ example: 10 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ required: false, example: 3 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(30)
    prevBirthsCount?: number;

    @ApiProperty({ required: false, example: 2024 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    prevLastBirthYear?: number;

    @ApiProperty({ required: false, example: 115.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    prevAvgWeaningWeight?: number;

    @ApiProperty({ required: false, example: 'Animal comprado con historial verbal del vendedor' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    notes?: string;
}
