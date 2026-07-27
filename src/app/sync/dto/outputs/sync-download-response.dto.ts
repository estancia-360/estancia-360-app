import { ApiProperty } from '@nestjs/swagger';
import {
    RanchPastureSyncDto,
    RanchLotSyncDto,
    RanchAnimalSyncDto,
    AnimalEventSyncDto,
    BreedingServiceSyncDto,
    GestationDiagnosisSyncDto,
    ParturitionSyncDto,
    WeaningSyncDto,
    AnimalDeclaredHistorySyncDto,
    WeightRecordSyncDto,
    RearingSelectionSyncDto,
    FatteningEntrySyncDto,
    FeedRecordSyncDto,
    VaccinationSyncDto,
    TreatmentSyncDto,
    HealthIncidentSyncDto,
    MovementSyncDto,
    MovementAnimalSyncDto,
    AnimalExitSyncDto,
} from './sync-download-entities.dto';

export class SyncDownloadEntitiesDto {
    @ApiProperty({ type: [RanchPastureSyncDto] }) ranchPastures: RanchPastureSyncDto[];
    @ApiProperty({ type: [RanchLotSyncDto] }) ranchLots: RanchLotSyncDto[];
    @ApiProperty({ type: [RanchAnimalSyncDto] }) ranchAnimals: RanchAnimalSyncDto[];
    @ApiProperty({ type: [AnimalEventSyncDto] }) animalEvents: AnimalEventSyncDto[];
    @ApiProperty({ type: [BreedingServiceSyncDto] }) breedingServices: BreedingServiceSyncDto[];
    @ApiProperty({ type: [GestationDiagnosisSyncDto] }) gestationDiagnoses: GestationDiagnosisSyncDto[];
    @ApiProperty({ type: [ParturitionSyncDto] }) parturitions: ParturitionSyncDto[];
    @ApiProperty({ type: [WeaningSyncDto] }) weanings: WeaningSyncDto[];
    @ApiProperty({ type: [AnimalDeclaredHistorySyncDto] }) animalDeclaredHistories: AnimalDeclaredHistorySyncDto[];
    @ApiProperty({ type: [WeightRecordSyncDto] }) weightRecords: WeightRecordSyncDto[];
    @ApiProperty({ type: [RearingSelectionSyncDto] }) rearingSelections: RearingSelectionSyncDto[];
    @ApiProperty({ type: [FatteningEntrySyncDto] }) fatteningEntries: FatteningEntrySyncDto[];
    @ApiProperty({ type: [FeedRecordSyncDto] }) feedRecords: FeedRecordSyncDto[];
    @ApiProperty({ type: [VaccinationSyncDto] }) vaccinations: VaccinationSyncDto[];
    @ApiProperty({ type: [TreatmentSyncDto] }) treatments: TreatmentSyncDto[];
    @ApiProperty({ type: [HealthIncidentSyncDto] }) healthIncidents: HealthIncidentSyncDto[];
    @ApiProperty({ type: [MovementSyncDto] }) movements: MovementSyncDto[];
    @ApiProperty({ type: [MovementAnimalSyncDto] }) movementAnimals: MovementAnimalSyncDto[];
    @ApiProperty({ type: [AnimalExitSyncDto] }) animalExits: AnimalExitSyncDto[];
}

export class SyncDeletionGroupDto {
    @ApiProperty({ description: 'Affected table name' }) table: string;
    @ApiProperty({ type: [Number], description: 'IDs deleted in that table' }) ids: number[];
}

export class SyncDownloadResponseDto {
    @ApiProperty({ description: 'Server timestamp at query time (ISO 8601). Use as `since` in the next sync.' })
    serverTime: string;

    @ApiProperty({ nullable: true, description: 'Opaque cursor (base64) to request the next page. `null` once fully downloaded.' })
    nextCursor: string | null;

    @ApiProperty({ type: SyncDownloadEntitiesDto })
    entities: SyncDownloadEntitiesDto;

    @ApiProperty({ type: [SyncDeletionGroupDto], description: 'Records deleted on the server since `since`, grouped by table.' })
    deletions: SyncDeletionGroupDto[];
}
