import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import {
    GESTATION_METHODS,
    GESTATION_RESULTS,
} from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';

/**
 * DTO para actualizar un diagnóstico de gestación.
 * Todos los campos son opcionales — solo se actualiza lo que se envía.
 * No se puede cambiar el evento ni el servicio de monta vinculado.
 */
export class UpdateGestationDiagnosisDto {
    @ApiProperty({
        description: 'Método de diagnóstico utilizado',
        enum: GESTATION_METHODS,
        required: false,
        example: 'ultrasound',
    })
    @IsOptional()
    @IsIn(GESTATION_METHODS, { message: `El método debe ser uno de: ${GESTATION_METHODS.join(', ')}` })
    method?: typeof GESTATION_METHODS[number];

    @ApiProperty({
        description: 'Resultado del diagnóstico de gestación',
        enum: GESTATION_RESULTS,
        required: false,
        example: 'pregnant',
    })
    @IsOptional()
    @IsIn(GESTATION_RESULTS, { message: `El resultado debe ser uno de: ${GESTATION_RESULTS.join(', ')}` })
    result?: typeof GESTATION_RESULTS[number];

    @ApiProperty({
        description: 'Días de gestación estimados al momento del diagnóstico',
        required: false,
        example: 45,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(300)
    gestationDays?: number;

    @ApiProperty({
        description: 'Fecha estimada de parto (YYYY-MM-DD)',
        required: false,
        example: '2026-09-15',
    })
    @IsOptional()
    @IsDateString({}, { message: 'estimatedBirth debe tener formato de fecha válido (YYYY-MM-DD)' })
    estimatedBirth?: Date;

    @ApiProperty({
        description: 'Nombre del veterinario que realizó el diagnóstico',
        required: false,
        example: 'Dr. López',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    veterinarian?: string;
}
