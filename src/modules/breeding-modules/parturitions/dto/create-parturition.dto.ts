import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { BirthTypeEnum, CriaStatusEnum, MotherConditionEnum } from '../entities/parturition.entity';

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

    @ApiProperty({ description: 'Tipo de parto', enum: BirthTypeEnum, example: BirthTypeEnum.NORMAL })
    @IsEnum(BirthTypeEnum, { message: 'El tipo de parto debe ser: normal, assisted o cesarean' })
    birthType: BirthTypeEnum;

    @ApiProperty({ description: 'Peso de la cría al nacer en kg', required: false, example: 35 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso debe ser un número con hasta 2 decimales' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    criaWeight?: number;

    @ApiProperty({ description: 'Estado de la cría al nacer', enum: CriaStatusEnum, example: CriaStatusEnum.ALIVE })
    @IsEnum(CriaStatusEnum, { message: 'El estado de la cría debe ser: alive o dead' })
    criaStatus: CriaStatusEnum;

    @ApiProperty({ description: 'Condición de la madre tras el parto', enum: MotherConditionEnum, required: false, example: MotherConditionEnum.GOOD })
    @IsOptional()
    @IsEnum(MotherConditionEnum, { message: 'La condición de la madre debe ser: good, regular o bad' })
    motherCondition?: MotherConditionEnum;
}
