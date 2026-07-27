import { ApiProperty } from '@nestjs/swagger';
import { SyncSectionDto } from './sync-common.dto';

export class SyncCriaResponseDto {
    @ApiProperty() totalSucceeded: number;
    @ApiProperty() totalFailed: number;
    @ApiProperty({ type: SyncSectionDto }) ranchPastures: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) ranchLots: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) ranchAnimals: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) breedingServices: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) gestationDiagnoses: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) parturitions: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) weanings: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) animalDeclaredHistories: SyncSectionDto;
}
