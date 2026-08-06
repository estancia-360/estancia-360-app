import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto';

export class FindAllRanchAnimalsParamsDto extends PaginationParamsDto {
    @ApiPropertyOptional({ example: 4 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idBreed?: number;

    @ApiPropertyOptional({ example: 2 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idMother?: number;

    @ApiPropertyOptional({ example: 3 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idFather?: number;

    @ApiPropertyOptional({ example: 2 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idStatus?: number;

    @ApiPropertyOptional({ example: 1 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idAnimalClass?: number;

    @ApiPropertyOptional({ example: 'BOV-2024-001' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ example: '2024-03-15' })
    @IsOptional()
    @IsDateString()
    birthdate?: Date;

    @ApiPropertyOptional({ example: 350 })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @IsPositive()
    weight?: number;

    @ApiPropertyOptional({ enum: ['F', 'M'], example: 'M' })
    @IsOptional()
    @IsEnum(['F', 'M'])
    sex?: 'F' | 'M';

    @ApiPropertyOptional({ example: 2, description: 'Exact match — used by Recría/Engorde to list only their stage.' })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idProductiveStatus?: number;

    @ApiPropertyOptional({
        example: 4,
        description: 'Excludes this productive status (NULL still counts as active, same rule as countActiveByRanch) — used by Sanidad.',
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    excludeProductiveStatus?: number;
}
