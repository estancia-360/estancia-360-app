import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';
import { GESTATION_METHODS, GESTATION_RESULTS } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';

export class RegisterGestationDiagnosisDto {
    @ApiProperty({ description: 'ID del animal hembra a diagnosticar', example: 10 })
    @IsInt({ message: 'El id del animal debe ser un número entero' })
    @IsPositive({ message: 'El id del animal debe ser positivo' })
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID del servicio de monta al que corresponde este diagnóstico', example: 3 })
    @IsInt({ message: 'El id del servicio debe ser un número entero' })
    @IsPositive({ message: 'El id del servicio debe ser positivo' })
    idService: number;

    @ApiProperty({ description: 'Método de diagnóstico utilizado', enum: GESTATION_METHODS, example: 'ultrasound' })
    @IsIn(GESTATION_METHODS, { message: 'El método debe ser: palpation o ultrasound' })
    method: typeof GESTATION_METHODS[number];

    @ApiProperty({ description: 'Resultado del diagnóstico', enum: GESTATION_RESULTS, example: 'pregnant' })
    @IsIn(GESTATION_RESULTS, { message: 'El resultado debe ser: pregnant o empty' })
    result: typeof GESTATION_RESULTS[number];

    @ApiProperty({ description: 'Días de gestación estimados al momento del diagnóstico', required: false, example: 45 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(300)
    gestationDays?: number;

    @ApiProperty({ description: 'Fecha estimada de parto (YYYY-MM-DD)', required: false, example: '2026-09-15' })
    @IsOptional()
    @IsDateString()
    estimatedBirth?: Date;

    @ApiProperty({ description: 'Nombre del veterinario', required: false, example: 'Dr. López' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    veterinarian?: string;

    @ApiProperty({ description: 'Notas adicionales del evento', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Fecha y hora en que se realizó el diagnóstico (ISO 8601)', example: '2026-04-01T10:00:00.000Z' })
    @IsDateString({}, { message: 'La fecha del diagnóstico debe tener formato ISO 8601 válido' })
    eventDate: Date;

    @ApiProperty({ description: 'Indica si el evento fue generado offline y se está sincronizando.', required: false })
    @IsOptional()
    isSynced?: boolean;
}
