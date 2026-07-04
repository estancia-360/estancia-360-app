import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class RegisterVaccinationDto {
    @ApiProperty({ description: 'ID del animal vacunado', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'Nombre de la vacuna o antiparasitario', example: 'Aftosa' })
    @IsString()
    vaccineName: string;

    @ApiProperty({ description: 'Dosis aplicada', example: '5ml', required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ description: 'Responsable o veterinario', example: 'Dr. Pérez', required: false })
    @IsOptional()
    @IsString()
    responsible?: string;

    @ApiProperty({ description: 'Fecha y hora de la vacunación (ISO 8601)', example: '2027-02-01T08:00:00.000Z' })
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
