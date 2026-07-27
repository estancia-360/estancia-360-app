import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { DataSyncOperationDto, EventSyncOperationDto } from './base-sync-operation.dto';

export class SyncRanchPastureOperationDto extends DataSyncOperationDto {}
export class SyncRanchLotOperationDto extends DataSyncOperationDto {}
export class SyncRanchAnimalOperationDto extends DataSyncOperationDto {}
export class SyncBreedingServiceOperationDto extends EventSyncOperationDto {}
export class SyncGestationDiagnosisOperationDto extends EventSyncOperationDto {}
export class SyncParturitionOperationDto extends EventSyncOperationDto {}
export class SyncWeaningOperationDto extends EventSyncOperationDto {}
export class SyncAnimalDeclaredHistoryOperationDto extends DataSyncOperationDto {}

/**
 * POST /sync/cria — offline batch payload for the Cría module.
 * Processing order (FK dependency chain, shared localId→serverId map across
 * the whole batch): ranchPastures → ranchLots → ranchAnimals →
 * breedingServices → gestationDiagnoses → parturitions → weanings →
 * animalDeclaredHistories.
 * Use "localRef_<field>": "<localId>" in `data` to reference a record created
 * earlier in this same batch that doesn't have a serverId yet.
 */
export class SyncCriaDto {
    @ApiProperty({ description: 'Ranch all records in this batch belong to', example: 1 })
    @IsInt()
    @Min(1)
    idRanch: number;

    @ApiPropertyOptional({ type: [SyncRanchPastureOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncRanchPastureOperationDto)
    ranchPastures?: SyncRanchPastureOperationDto[];

    @ApiPropertyOptional({ type: [SyncRanchLotOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncRanchLotOperationDto)
    ranchLots?: SyncRanchLotOperationDto[];

    @ApiPropertyOptional({ type: [SyncRanchAnimalOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncRanchAnimalOperationDto)
    ranchAnimals?: SyncRanchAnimalOperationDto[];

    @ApiPropertyOptional({ type: [SyncBreedingServiceOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncBreedingServiceOperationDto)
    breedingServices?: SyncBreedingServiceOperationDto[];

    @ApiPropertyOptional({ type: [SyncGestationDiagnosisOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncGestationDiagnosisOperationDto)
    gestationDiagnoses?: SyncGestationDiagnosisOperationDto[];

    @ApiPropertyOptional({ type: [SyncParturitionOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncParturitionOperationDto)
    parturitions?: SyncParturitionOperationDto[];

    @ApiPropertyOptional({ type: [SyncWeaningOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncWeaningOperationDto)
    weanings?: SyncWeaningOperationDto[];

    @ApiPropertyOptional({ type: [SyncAnimalDeclaredHistoryOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncAnimalDeclaredHistoryOperationDto)
    animalDeclaredHistories?: SyncAnimalDeclaredHistoryOperationDto[];
}
