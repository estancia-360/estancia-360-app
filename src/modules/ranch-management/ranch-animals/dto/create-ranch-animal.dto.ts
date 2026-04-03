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
    Min
} from 'class-validator';

export class CreateRanchAnimalDto {
    @ApiProperty({ description: 'ID de la estancia a la que pertenece el animal', example: 1 })
    @IsInt({ message: 'El id de la estancia debe ser un número entero' })
    @IsPositive({ message: 'El id de la estancia debe ser un número positivo' })
    idRanch: number;

    @ApiProperty({ description: 'Código de la madre', example: 'VAC-002', required: false })
    @IsOptional()
    @IsString({ message: 'El código debe ser un texto' })
    @IsNotEmpty({ message: 'El código no puede estar vacío si se envía' })
    @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
    codeMother?: string;

    @ApiProperty({ description: 'Código del padre', example: 'VAC-003', required: false })
    @IsOptional()
    @IsString({ message: 'El código debe ser un texto' })
    @IsNotEmpty({ message: 'El código no puede estar vacío si se envía' })
    @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
    codeFather?: string;

    @ApiProperty({ description: 'ID de la raza del animal', example: 3 })
    @IsInt({ message: 'El id de la raza debe ser un número entero' })
    @IsPositive({ message: 'El id de la raza debe ser un número positivo' })
    idBreed: number;

    @ApiProperty({ description: 'ID del estado actual del animal', example: 1 })
    @IsInt({ message: 'El id del estado debe ser un número entero' })
    @IsPositive({ message: 'El id del estado debe ser un número positivo' })
    idStatus: number;

    @ApiProperty({ description: 'ID de la clase del animal', example: 1 })
    @IsInt({ message: 'El id de la clase debe ser un número entero' })
    @IsPositive({ message: 'El id de la clase debe ser un número positivo' })
    idAnimalClass: number;

    @ApiProperty({ description: 'ID del lote al que pertenece el animal', example: 1, required: false })
    @IsOptional()
    @IsInt({ message: 'El id del lote debe ser un número entero' })
    @IsPositive({ message: 'El id del lote debe ser un número positivo' })
    idLot?: number;

    @ApiProperty({ description: 'ID del estado productivo del animal', example: 1, required: false })
    @IsOptional()
    @IsInt({ message: 'El id del estado productivo debe ser un número entero' })
    @IsPositive({ message: 'El id del estado productivo debe ser un número positivo' })
    idProductiveStatus?: number;

    @ApiProperty({ description: 'Código único del animal', example: 'VAC-001' })
    @IsString({ message: 'El código debe ser un texto' })
    @IsNotEmpty({ message: 'El código es obligatorio' })
    @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
    code: string;

    @ApiProperty({ description: 'Fecha de nacimiento del animal', example: '2022-05-10' })
    @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)' })
    birthdate: Date;

    @ApiProperty({ description: 'Peso del animal en kilogramos', example: 350.75, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso debe ser un número con hasta dos decimales' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    weight?: number;

    @ApiProperty({ description: 'Sexo del animal (F = Hembra, M = Macho)', example: 'F' })
    @IsString({ message: 'El sexo debe ser un texto' })
    @IsIn(['F', 'M'], { message: 'El sexo solo puede ser F (Hembra) o M (Macho)' })
    sex: 'F' | 'M';

    @ApiProperty({ description: 'Fecha y hora en la que el animal fue registrado en el dispositivo', example: '2026-01-24T10:30:00.000Z' })
    @IsDateString({}, { message: 'La fecha de registro debe tener un formato de fecha válido' })
    createdAt: Date;
}
