import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { EventSyncOperationDto } from './base-sync-operation.dto';

export class SyncVaccinationOperationDto extends EventSyncOperationDto {}
export class SyncTreatmentOperationDto extends EventSyncOperationDto {}
export class SyncHealthIncidentOperationDto extends EventSyncOperationDto {}

/**
 * POST /sync/sanidad — offline batch payload for the Sanidad module.
 * Order: vaccinations → treatments → healthIncidents. Applies at any
 * productive stage (Cría, Recría, Engorde) regardless of the ranch's
 * enabled rubros.
 *
 * Note: vaccinations/treatments/healthIncidents have no local_id column in
 * the real schema, so unlike the rest of this endpoint, retrying the same
 * "create" operation here is NOT idempotent — it creates a duplicate row.
 */
export class SyncSanidadDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    idRanch: number;

    @ApiPropertyOptional({ type: [SyncVaccinationOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncVaccinationOperationDto)
    vaccinations?: SyncVaccinationOperationDto[];

    @ApiPropertyOptional({ type: [SyncTreatmentOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncTreatmentOperationDto)
    treatments?: SyncTreatmentOperationDto[];

    @ApiPropertyOptional({ type: [SyncHealthIncidentOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncHealthIncidentOperationDto)
    healthIncidents?: SyncHealthIncidentOperationDto[];
}
