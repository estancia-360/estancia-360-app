import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVaccinationDto {
    @ApiProperty({ description: 'Nuevo nombre de la vacuna o antiparasitario', required: false })
    @IsOptional()
    @IsString()
    vaccineName?: string;

    @ApiProperty({ description: 'Nueva dosis aplicada', required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ description: 'Nuevo responsable o veterinario', required: false })
    @IsOptional()
    @IsString()
    responsible?: string;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
