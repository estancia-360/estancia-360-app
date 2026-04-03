import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
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
import { BirthTypeEnum, CriaStatusEnum, MotherConditionEnum } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';

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

    @ApiProperty({ description: 'ID de la clase del animal (ej: Ternera=1, Ternero Macho Entero=2)', example: 1 })
    @IsInt()
    @IsPositive()
    idAnimalClass: number;

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

    @ApiProperty({ description: 'Tipo de parto', enum: BirthTypeEnum, example: BirthTypeEnum.NORMAL })
    @IsEnum(BirthTypeEnum, { message: 'El tipo de parto debe ser: normal, assisted o cesarean' })
    birthType: BirthTypeEnum;

    @ApiProperty({ description: 'Estado de la cría al nacer', enum: CriaStatusEnum, example: CriaStatusEnum.ALIVE })
    @IsEnum(CriaStatusEnum, { message: 'El estado de la cría debe ser: alive o dead' })
    criaStatus: CriaStatusEnum;

    @ApiProperty({ description: 'Peso de la cría al nacer (kg)', required: false, example: 35 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    criaWeight?: number;

    @ApiProperty({ description: 'Condición de la madre tras el parto', enum: MotherConditionEnum, required: false, example: MotherConditionEnum.GOOD })
    @IsOptional()
    @IsEnum(MotherConditionEnum, { message: 'La condición de la madre debe ser: good, regular o bad' })
    motherCondition?: MotherConditionEnum;

    @ApiProperty({
        description: 'Datos para registrar la cría en el sistema. OBLIGATORIO si criaStatus = "alive".',
        type: CriaRegistrationDto,
        required: false,
    })
    @ValidateIf(o => o.criaStatus === CriaStatusEnum.ALIVE)
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
