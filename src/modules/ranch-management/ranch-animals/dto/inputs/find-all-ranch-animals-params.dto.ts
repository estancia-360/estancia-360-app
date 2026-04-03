import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString
} from "class-validator";
import { PaginationParamsDto } from "src/shared/dto/pagination-params.dto";

export class FindAllRanchAnimalsParamsDto extends PaginationParamsDto {

    @ApiPropertyOptional({ description: "ID de la raza del animal", example: 4 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idBreed?: number;

    @ApiPropertyOptional({ description: "ID de la madre", example: 2 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idMother?: number;

    @ApiPropertyOptional({ description: "ID del padre", example: 3 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idFather?: number;

    @ApiPropertyOptional({ description: "ID del estado del animal", example: 2 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idStatus?: number;

    @ApiPropertyOptional({ description: "ID de la clase del animal", example: 1 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    idAnimalClass?: number;

    @ApiPropertyOptional({ description: "Código identificador del animal", example: "BOV-2024-001" })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ description: "Fecha de nacimiento del animal (YYYY-MM-DD)", example: "2024-03-15" })
    @IsOptional()
    @IsDateString()
    birthdate?: Date;

    @ApiPropertyOptional({ description: "Peso del animal", example: 350 })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @IsPositive()
    weight?: number;

    @ApiPropertyOptional({ description: "Sexo del animal", enum: ['F', 'M'], example: "M" })
    @IsOptional()
    @IsEnum(['F', 'M'])
    sex?: 'F' | 'M';

    @ApiPropertyOptional({ description: "Fecha y hora exacta de creación del registro (ISO 8601)", example: "2026-01-10T14:35:20.000Z" })
    @IsOptional()
    @IsDateString()
    createdAt?: Date;
}
