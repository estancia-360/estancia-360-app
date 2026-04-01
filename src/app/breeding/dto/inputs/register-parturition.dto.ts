import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
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
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { BIRTH_TYPES, CRIA_STATUS, MOTHER_CONDITION } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';

/**
 * Datos para registrar la cría en el sistema cuando nació viva.
 * Si criaStatus = 'alive', este objeto es obligatorio.
 */
export class CriaRegistrationDto {
    @ApiProperty({ description: 'Código/arete único de la cría en la estancia', example: 'BOV-2026-045' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @ApiProperty({ description: 'ID de la raza de la cría', example: 2 })
    @IsInt()
    @IsPositive()
    idBreed: number;

    @ApiProperty({ description: 'ID del estado inicial de la cría (activo/vivo)', example: 1 })
    @IsInt()
    @IsPositive()
    idStatus: number;

    @ApiProperty({ description: 'Sexo de la cría', enum: ['F', 'M'], example: 'F' })
    @IsIn(['F', 'M'], { message: 'El sexo de la cría debe ser F o M' })
    sex: 'F' | 'M';

    @ApiProperty({ description: 'Peso de la cría al nacer (kg)', required: false, example: 35.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weight?: number;
}

export class RegisterParturitionDto {
    @ApiProperty({ description: 'ID del animal hembra (madre)', example: 10 })
    @IsInt({ message: 'El id de la madre debe ser un número entero' })
    @IsPositive({ message: 'El id de la madre debe ser positivo' })
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID del diagnóstico de gestación (positivo) que origina este parto', example: 2 })
    @IsInt({ message: 'El id del diagnóstico debe ser un número entero' })
    @IsPositive({ message: 'El id del diagnóstico debe ser positivo' })
    idDiagnosis: number;

    @ApiProperty({ description: 'Tipo de parto', enum: BIRTH_TYPES, example: 'normal' })
    @IsIn(BIRTH_TYPES, { message: 'El tipo de parto debe ser: normal, assisted o cesarean' })
    birthType: typeof BIRTH_TYPES[number];

    @ApiProperty({ description: 'Estado de la cría al nacer', enum: CRIA_STATUS, example: 'alive' })
    @IsIn(CRIA_STATUS, { message: 'El estado de la cría debe ser: alive o dead' })
    criaStatus: typeof CRIA_STATUS[number];

    @ApiProperty({ description: 'Peso de la cría al nacer (kg)', required: false, example: 35 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    criaWeight?: number;

    @ApiProperty({ description: 'Condición de la madre tras el parto', enum: MOTHER_CONDITION, required: false, example: 'good' })
    @IsOptional()
    @IsIn(MOTHER_CONDITION)
    motherCondition?: typeof MOTHER_CONDITION[number];

    @ApiProperty({
        description: 'Datos para registrar la cría en el sistema. OBLIGATORIO si criaStatus = "alive".',
        type: CriaRegistrationDto,
        required: false,
    })
    @ValidateIf(o => o.criaStatus === 'alive')
    @ValidateNested()
    @Type(() => CriaRegistrationDto)
    criaData?: CriaRegistrationDto;

    @ApiProperty({ description: 'Notas adicionales del parto', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Fecha y hora del parto (ISO 8601)', example: '2026-07-10T06:30:00.000Z' })
    @IsDateString({}, { message: 'La fecha del parto debe tener formato ISO 8601 válido' })
    eventDate: Date;

    @ApiProperty({ description: 'Indica si el evento fue generado offline y se está sincronizando.', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
