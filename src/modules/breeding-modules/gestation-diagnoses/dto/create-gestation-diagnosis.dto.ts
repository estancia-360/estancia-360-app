import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';
import { GestationMethodEnum, GestationResultEnum } from '../entities/gestation-diagnosis.entity';

export class CreateGestationDiagnosisDto {
    @ApiProperty({ description: 'ID del evento animal al que pertenece este diagnóstico', example: 6 })
    @IsInt({ message: 'El id del evento debe ser un número entero' })
    @IsPositive({ message: 'El id del evento debe ser positivo' })
    idEvent: number;

    @ApiProperty({ description: 'ID del servicio de monta al que corresponde este diagnóstico', example: 3 })
    @IsInt({ message: 'El id del servicio debe ser un número entero' })
    @IsPositive({ message: 'El id del servicio debe ser positivo' })
    idService: number;

    @ApiProperty({ description: 'Método de diagnóstico utilizado', enum: GestationMethodEnum, example: GestationMethodEnum.ULTRASOUND })
    @IsEnum(GestationMethodEnum, { message: 'El método debe ser: palpation o ultrasound' })
    method: GestationMethodEnum;

    @ApiProperty({ description: 'Resultado del diagnóstico', enum: GestationResultEnum, example: GestationResultEnum.PREGNANT })
    @IsEnum(GestationResultEnum, { message: 'El resultado debe ser: pregnant o empty' })
    result: GestationResultEnum;

    @ApiProperty({ description: 'Días de gestación estimados al momento del diagnóstico', required: false, example: 45 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Los días de gestación deben ser un número entero' })
    @Min(1, { message: 'Los días de gestación deben ser mayor a 0' })
    @Max(300, { message: 'Los días de gestación no pueden superar 300' })
    gestationDays?: number;

    @ApiProperty({ description: 'Fecha estimada de parto (YYYY-MM-DD)', required: false, example: '2026-09-15' })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha estimada de parto debe tener formato YYYY-MM-DD' })
    estimatedBirth?: Date;

    @ApiProperty({ description: 'Nombre del veterinario que realizó el diagnóstico', required: false, example: 'Dr. López' })
    @IsOptional()
    @IsString({ message: 'El veterinario debe ser texto' })
    @IsNotEmpty({ message: 'El veterinario no puede estar vacío si se envía' })
    @MaxLength(150, { message: 'El nombre del veterinario no puede superar 150 caracteres' })
    veterinarian?: string;
}
