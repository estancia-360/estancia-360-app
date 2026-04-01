import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { SERVICE_TYPES } from '../entities/breeding-service.entity';

export class CreateBreedingServiceDto {
    @ApiProperty({ description: 'ID del evento animal al que pertenece este servicio', example: 5 })
    @IsInt({ message: 'El id del evento debe ser un número entero' })
    @IsPositive({ message: 'El id del evento debe ser positivo' })
    idEvent: number;

    @ApiProperty({ description: 'ID del animal macho (null si IA sin toro identificado)', required: false, example: 12 })
    @IsOptional()
    @IsInt({ message: 'El id del animal macho debe ser un número entero' })
    @IsPositive({ message: 'El id del animal macho debe ser positivo' })
    idAnimalMale?: number;

    @ApiProperty({ description: 'Tipo de servicio reproductivo', enum: SERVICE_TYPES, example: 'natural' })
    @IsIn(SERVICE_TYPES, { message: 'El tipo de servicio debe ser: natural, artificial_insemination o embryo_transfer' })
    serviceType: typeof SERVICE_TYPES[number];

    @ApiProperty({ description: 'Raza del semen (para inseminación artificial)', required: false, example: 'Angus' })
    @IsOptional()
    @IsString({ message: 'La raza del semen debe ser texto' })
    @IsNotEmpty({ message: 'La raza del semen no puede estar vacía si se envía' })
    @MaxLength(100, { message: 'La raza del semen no puede superar 100 caracteres' })
    semenBreed?: string;

    @ApiProperty({ description: 'Nombre del técnico que realizó el servicio', required: false, example: 'Dr. Pérez' })
    @IsOptional()
    @IsString({ message: 'El técnico debe ser texto' })
    @IsNotEmpty({ message: 'El técnico no puede estar vacío si se envía' })
    @MaxLength(150, { message: 'El nombre del técnico no puede superar 150 caracteres' })
    technician?: string;

    @ApiProperty({ description: 'Código del lote reproductivo', required: false, example: 'LOT-2026-01' })
    @IsOptional()
    @IsString({ message: 'El lote reproductivo debe ser texto' })
    @IsNotEmpty({ message: 'El lote reproductivo no puede estar vacío si se envía' })
    @MaxLength(100, { message: 'El lote reproductivo no puede superar 100 caracteres' })
    reproductiveLot?: string;
}
