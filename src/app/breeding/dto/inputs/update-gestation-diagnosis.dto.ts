import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import {
    GestationMethodEnum,
    GestationResultEnum,
} from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';

export class UpdateGestationDiagnosisDto {
    @ApiProperty({
        description: 'Método de diagnóstico utilizado',
        enum: GestationMethodEnum,
        required: false,
        example: GestationMethodEnum.ULTRASOUND,
    })
    @IsOptional()
    @IsEnum(GestationMethodEnum, { message: 'El método debe ser: palpation o ultrasound' })
    method?: GestationMethodEnum;

    @ApiProperty({
        description: 'Resultado del diagnóstico de gestación',
        enum: GestationResultEnum,
        required: false,
        example: GestationResultEnum.PREGNANT,
    })
    @IsOptional()
    @IsEnum(GestationResultEnum, { message: 'El resultado debe ser: pregnant o empty' })
    result?: GestationResultEnum;

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
