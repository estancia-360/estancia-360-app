import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateAnimalDeclaredHistoryDto {
    @ApiProperty({ required: false, example: 4 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(30)
    prevBirthsCount?: number;

    @ApiProperty({ required: false, example: 2023 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    prevLastBirthYear?: number;

    @ApiProperty({ required: false, example: 118.0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    prevAvgWeaningWeight?: number;

    @ApiProperty({ required: false, example: 'Se corrigió el conteo de partos tras consulta con el vendedor' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    notes?: string;
}
