import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class RegisterTreatmentDto {
    @ApiProperty({ description: 'ID del animal tratado', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'Enfermedad o diagnóstico', example: 'Mastitis', required: false })
    @IsOptional()
    @IsString()
    illness?: string;

    @ApiProperty({ description: 'Medicamento aplicado', example: 'Penicilina' })
    @IsString()
    medication: string;

    @ApiProperty({ description: 'Dosis aplicada', example: '10ml', required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ description: 'Duración total del tratamiento en días', example: 5, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    durationDays?: number;

    @ApiProperty({
        description: 'Días de retiro sanitario del medicamento (0 o ausente = sin retiro). El backend calcula automáticamente withdrawalEndDate = eventDate + withdrawalDays.',
        example: 7,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    withdrawalDays?: number;

    @ApiProperty({ description: 'Veterinario o responsable', example: 'Dr. Pérez', required: false })
    @IsOptional()
    @IsString()
    responsible?: string;

    @ApiProperty({ description: 'Fecha y hora del tratamiento (ISO 8601)', example: '2027-02-01T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Indica si el evento fue registrado offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
