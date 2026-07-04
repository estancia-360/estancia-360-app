import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { IncidentTypeEnum } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';

export class RegisterHealthIncidentDto {
    @ApiProperty({ description: 'ID del animal', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({
        description: 'Tipo de incidente. "quarantine" pone automáticamente al animal en id_status=2 (En Observación).',
        enum: IncidentTypeEnum,
        example: IncidentTypeEnum.QUARANTINE,
    })
    @IsEnum(IncidentTypeEnum)
    incidentType: IncidentTypeEnum;

    @ApiProperty({ description: 'Descripción del incidente (síntomas, observaciones)', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Fecha y hora del incidente (ISO 8601)', example: '2027-02-01T08:00:00.000Z' })
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
