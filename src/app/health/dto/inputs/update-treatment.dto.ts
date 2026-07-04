import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateTreatmentDto {
    @ApiProperty({ description: 'Nueva enfermedad o diagnóstico', required: false })
    @IsOptional()
    @IsString()
    illness?: string;

    @ApiProperty({ description: 'Nuevo medicamento aplicado', required: false })
    @IsOptional()
    @IsString()
    medication?: string;

    @ApiProperty({ description: 'Nueva dosis aplicada', required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ description: 'Nueva duración total en días', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    durationDays?: number;

    @ApiProperty({
        description: 'Nuevos días de retiro. El backend recalcula withdrawalEndDate = event_date (original) + withdrawalDays.',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    withdrawalDays?: number;

    @ApiProperty({ description: 'Nuevo responsable o veterinario', required: false })
    @IsOptional()
    @IsString()
    responsible?: string;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
