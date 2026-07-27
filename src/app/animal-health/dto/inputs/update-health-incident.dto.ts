import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateHealthIncidentDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Resolution date. If the incident was "quarantine", the backend automatically reverts the animal to id_status=1 (Activo).',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    resolvedAt?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
