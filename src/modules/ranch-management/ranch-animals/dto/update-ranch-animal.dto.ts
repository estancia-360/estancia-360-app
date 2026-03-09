import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRanchAnimalDto } from './create-ranch-animal.dto';
import { IsInt, IsPositive, IsOptional, IsString, IsNotEmpty, MaxLength, IsDateString, IsNumber, Min, IsIn, IsBoolean } from 'class-validator';

export class UpdateRanchAnimalDto {
    @ApiProperty({
        description: 'ID de la estancia a la que pertenece el animal',
        example: 1
    })
    @IsOptional()
    @IsInt({ message: 'El id de la estancia debe ser un número entero' })
    @IsPositive({ message: 'El id de la estancia debe ser un número positivo' })
    idRanch?: number;


    @ApiProperty({
        description: 'Código de la madre',
        example: 'VAC-002'
    })
    @IsOptional()
    @IsString({ message: 'El código debe ser un texto' })
    @IsNotEmpty({ message: 'El código es obligatorio' })
    @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
    codeMother?: string;

    @ApiProperty({
        description: 'Código del padre',
        example: 'VAC-003'
    })
    @IsOptional()
    @IsString({ message: 'El código debe ser un texto' })
    @IsNotEmpty({ message: 'El código es obligatorio' })
    @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
    codeFather?: string;

    @ApiProperty({
        description: 'ID de la raza del animal',
        example: 3
    })
    @IsOptional()
    @IsInt({ message: 'El id de la raza debe ser un número entero' })
    @IsPositive({ message: 'El id de la raza debe ser un número positivo' })
    idBreed?: number;


    @ApiProperty({
        description: 'ID del estado actual del animal',
        example: 1
    })
    @IsOptional()
    @IsInt({ message: 'El id del estado debe ser un número entero' })
    @IsPositive({ message: 'El id del estado debe ser un número positivo' })
    idStatus?: number;


    @ApiProperty({
        description: 'Código único del animal',
        example: 'VAC-001'
    })
    @IsOptional()
    @IsString({ message: 'El código debe ser un texto' })
    @IsNotEmpty({ message: 'El código es obligatorio' })
    @MaxLength(50, { message: 'El código no puede superar los 50 caracteres' })
    code?: string;


    @ApiProperty({
        description: 'Fecha de nacimiento del animal',
        example: '2022-05-10'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)' })
    birthdate?: Date;


    @ApiProperty({
        description: 'Peso del animal en kilogramos',
        example: 350.75,
        required: false
    })
    @IsOptional()
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El peso debe ser un número con hasta dos decimales' }
    )
    @IsOptional()
    @Min(0, { message: 'El peso no puede ser negativo' })
    weight?: number;


    @ApiProperty({
        description: 'Sexo del animal (F = Hembra, M = Macho)',
        example: 'F'
    })
    @IsOptional()
    @IsString({ message: 'El sexo debe ser un texto' })
    @IsIn(['F', 'M'], { message: 'El sexo solo puede ser F (Hembra) o M (Macho)' })
    sex?: 'F' | 'M';


    @ApiProperty({
        description: 'Indica si el animal está castrado',
        required: false
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo castrado debe ser verdadero o falso' })
    isCastrated?: boolean;


    @ApiProperty({
        description: 'Indica si el animal está esterilizado',
        required: false
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo esterilizado debe ser verdadero o falso' })
    isSterilized?: boolean;


    @ApiProperty({
        description: 'Indica si el animal ya ha parido',
        required: false
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo de parto debe ser verdadero o falso' })
    hasCalved?: boolean;

    @ApiProperty({
        description: 'Fecha y hora en la que el animal fue registrado en el dispositivo',
        example: '2026-01-24T10:30:00.000Z'
    })
    @IsOptional()
    @IsDateString({}, {
        message: 'La fecha de registro debe tener un formato de fecha válido'
    })
    createdAt?: Date;
}
