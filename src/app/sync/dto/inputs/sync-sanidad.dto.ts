import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsObject, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseSyncOperationDto } from './sync-cria.dto';

export class SyncVaccinationOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos de la vacunación.
**Campos create:** idRanchAnimal (o localRef_idRanchAnimal), vaccineName, dose, responsible.
**Campos update:** vaccineName, dose, responsible, notes.
**Campos delete:** vacío.`,
        example: { idRanchAnimal: 4, vaccineName: 'Aftosa', dose: '5ml' },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora de la vacunación (ISO 8601)', example: '2027-05-10T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncTreatmentOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos del tratamiento.
**Campos create:** idRanchAnimal (o localRef_idRanchAnimal), medication, illness, dose, durationDays, withdrawalDays, responsible.
**Campos update:** illness, medication, dose, durationDays, withdrawalDays, responsible, notes.
**Campos delete:** vacío.
El backend calcula \`withdrawalEndDate\` automáticamente a partir de \`happenedAt\` + \`withdrawalDays\`.`,
        example: { idRanchAnimal: 4, medication: 'Penicilina', withdrawalDays: 7 },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora del tratamiento (ISO 8601)', example: '2027-05-10T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncHealthIncidentOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos del incidente sanitario.
**Campos create:** idRanchAnimal (o localRef_idRanchAnimal), incidentType ('illness_detected' | 'quarantine'), description.
**Campos update:** description, resolvedAt, notes.
**Campos delete:** vacío.`,
        example: { idRanchAnimal: 4, incidentType: 'quarantine', description: 'Sospecha de enfermedad respiratoria' },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora del incidente (ISO 8601)', example: '2027-05-10T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncSanidadDto {
    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiPropertyOptional({
        type: [SyncVaccinationOperationDto],
        description: 'Vacunaciones. Se procesan primero.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncVaccinationOperationDto)
    vaccinations?: SyncVaccinationOperationDto[];

    @ApiPropertyOptional({
        type: [SyncTreatmentOperationDto],
        description: 'Tratamientos. Se procesan después de las vacunaciones.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncTreatmentOperationDto)
    treatments?: SyncTreatmentOperationDto[];

    @ApiPropertyOptional({
        type: [SyncHealthIncidentOperationDto],
        description: 'Incidentes sanitarios. Se procesan al final.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncHealthIncidentOperationDto)
    healthIncidents?: SyncHealthIncidentOperationDto[];
}
