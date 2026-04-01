import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { BIRTH_TYPES, CRIA_STATUS, MOTHER_CONDITION } from '../entities/parturition.entity';

export class CreateParturitionDto {
    @ApiProperty({ description: 'ID del evento animal al que pertenece este parto', example: 7 })
    @IsInt({ message: 'El id del evento debe ser un número entero' })
    @IsPositive({ message: 'El id del evento debe ser positivo' })
    idEvent: number;

    @ApiProperty({ description: 'ID del diagnóstico de gestación que origina este parto', example: 2 })
    @IsInt({ message: 'El id del diagnóstico debe ser un número entero' })
    @IsPositive({ message: 'El id del diagnóstico debe ser positivo' })
    idDiagnosis: number;

    @ApiProperty({ description: 'ID del animal cría creado en el sistema (null si nació muerto)', required: false, example: 20 })
    @IsOptional()
    @IsInt({ message: 'El id de la cría debe ser un número entero' })
    @IsPositive({ message: 'El id de la cría debe ser positivo' })
    idCria?: number;

    @ApiProperty({ description: 'Tipo de parto', enum: BIRTH_TYPES, example: 'normal' })
    @IsIn(BIRTH_TYPES, { message: 'El tipo de parto debe ser: normal, assisted o cesarean' })
    birthType: typeof BIRTH_TYPES[number];

    @ApiProperty({ description: 'Peso de la cría al nacer en kg', required: false, example: 35 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso debe ser un número con hasta 2 decimales' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    criaWeight?: number;

    @ApiProperty({ description: 'Estado de la cría al nacer', enum: CRIA_STATUS, example: 'alive' })
    @IsIn(CRIA_STATUS, { message: 'El estado de la cría debe ser: alive o dead' })
    criaStatus: typeof CRIA_STATUS[number];

    @ApiProperty({ description: 'Condición de la madre tras el parto', enum: MOTHER_CONDITION, required: false, example: 'good' })
    @IsOptional()
    @IsIn(MOTHER_CONDITION, { message: 'La condición de la madre debe ser: good, regular o bad' })
    motherCondition?: typeof MOTHER_CONDITION[number];
}
