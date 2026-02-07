import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString
} from "class-validator";
import { PaginationParamsDto } from "src/shared/dto/pagination-params.dto";
import { transformToBoolean } from "src/shared/utils";

export class FindAllRanchAnimalsParamsDto extends PaginationParamsDto {

    @ApiPropertyOptional({
        description: "ID de la raza del animal",
        example: 4
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idBreed?: number;

    @ApiPropertyOptional({
        description: "ID del estado del animal",
        example: 2
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idStatus?: number;

    @ApiPropertyOptional({
        description: "Código identificador del animal",
        example: "BOV-2024-001"
    })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({
        description: "Fecha de nacimiento del animal en formato ISO (YYYY-MM-DD)",
        example: "2024-03-15"
    })
    @IsOptional()
    @IsDateString()
    birthdate?: Date;

    @ApiPropertyOptional({
        description: "Peso del animal",
        example: 350
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    weight?: number;

    @ApiPropertyOptional({
        description: "Sexo del animal",
        enum: ['F', 'M'],
        example: "M"
    })
    @IsOptional()
    @IsEnum(['F', 'M'])
    sex?: 'F' | 'M';

    @ApiPropertyOptional({
        description: "Indica si el animal está castrado",
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => transformToBoolean(value, 'isCastrated'))
    isCastrated?: boolean;

    @ApiPropertyOptional({
        description: "Indica si el animal está esterilizado",
        example: false
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => transformToBoolean(value, 'isSterilized'))
    isSterilized?: boolean;

    @ApiPropertyOptional({
        description: "Indica si el animal ya ha parido",
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => transformToBoolean(value, 'hasCalved'))
    hasCalved?: boolean;

    @ApiPropertyOptional({
        description: "Fecha y hora exacta de creación del registro (ISO 8601)",
        example: "2026-01-10T14:35:20.000Z"
    })
    @IsOptional()
    @IsDateString()
    createdAt?: Date;
}
