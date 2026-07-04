import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateHealthIncidentDto {
    @ApiProperty({ description: 'Nueva descripción del incidente', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Fecha de resolución del incidente. Si el incidente era "quarantine", el backend revierte automáticamente al animal a id_status=1 (Activo).',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    resolvedAt?: Date;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
