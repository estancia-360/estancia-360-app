import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class RanchPastureSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idRanch: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() @Type(() => Number) areaHectares: number;
    @ApiProperty({ required: false }) @Expose() description?: string;
    @ApiProperty() @Expose() isActive: boolean;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class RanchLotSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idRanch: number;
    @ApiProperty() @Expose() @Type(() => Number) idRanchPasture: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() lotType: string;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) capacity: number | null;
    @ApiProperty() @Expose() isActive: boolean;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class RanchAnimalSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idRanch: number;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idMother?: number;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idFather?: number;
    @ApiProperty() @Expose() @Type(() => Number) idBreed: number;
    @ApiProperty() @Expose() @Type(() => Number) idStatus: number;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idProductiveStatus?: number;
    @ApiProperty() @Expose() @Type(() => Number) idAnimalClass: number;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idLot?: number;
    @ApiProperty() @Expose() code: string;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() birthdate: Date;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) weight?: number;
    @ApiProperty() @Expose() sex: 'F' | 'M';
    @ApiProperty({ required: false }) @Expose() origin?: string;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class AnimalEventSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idRanchAnimal: number;
    @ApiProperty() @Expose() @Type(() => Number) idEventType: number;
    @ApiProperty({ required: false }) @Expose() notes?: string;
    @ApiProperty() @Expose() isSynced: boolean;
    @ApiProperty() @Expose() eventDate: Date;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class BreedingServiceSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idEvent: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idAnimalMale?: number;
    @ApiProperty() @Expose() serviceType: string;
    @ApiProperty({ required: false }) @Expose() semenBreed?: string;
    @ApiProperty({ required: false }) @Expose() technician?: string;
    @ApiProperty({ required: false }) @Expose() reproductiveLot?: string;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class GestationDiagnosisSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idEvent: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() @Type(() => Number) idService: number;
    @ApiProperty() @Expose() method: string;
    @ApiProperty() @Expose() result: string;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) gestationDays?: number;
    @ApiProperty({ required: false }) @Expose() estimatedBirth?: Date;
    @ApiProperty({ required: false }) @Expose() veterinarian?: string;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class ParturitionSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idEvent: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() @Type(() => Number) idDiagnosis: number;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idCria?: number;
    @ApiProperty() @Expose() birthType: string;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) criaWeight?: number;
    @ApiProperty() @Expose() criaStatus: string;
    @ApiProperty({ required: false }) @Expose() motherCondition?: string;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class WeaningSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idEvent: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() @Type(() => Number) idCria: number;
    @ApiProperty() @Expose() @Type(() => Number) idLotDest: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) weaningWeight?: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) weaningAge?: number;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class AnimalDeclaredHistorySyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idRanchAnimal: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) prevBirthsCount?: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) prevLastBirthYear?: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) prevAvgWeaningWeight?: number;
    @ApiProperty({ required: false }) @Expose() notes?: string;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class WeightRecordSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idEvent: number;
    @ApiProperty() @Expose() @Type(() => Number) idLot: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() @Type(() => Number) weight: number;
    @ApiProperty() @Expose() weightType: string;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) bodyCondition?: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) ageDays?: number;
    @ApiProperty({ required: false }) @Expose() notes?: string;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class RearingSelectionSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idEvent: number;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idLotDest?: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() destination: string;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) weightAtSelection?: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) bodyCondition?: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) geneticScore?: number;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class FatteningEntrySyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idEvent: number;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) initialWeight?: number;
    @ApiProperty() @Expose() systemType: string;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}

export class FeedRecordSyncDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() @Type(() => Number) idLot: number;
    @ApiProperty({ required: false, nullable: true }) @Expose() @Type(() => Number) idUser?: number;
    @ApiProperty({ required: false }) @Expose() localId?: string;
    @ApiProperty() @Expose() feedDate: Date;
    @ApiProperty() @Expose() feedType: string;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) quantity?: number;
    @ApiProperty({ required: false }) @Expose() unit?: string;
    @ApiProperty({ required: false }) @Expose() @Type(() => Number) cost?: number;
    @ApiProperty({ required: false }) @Expose() notes?: string;
    @ApiProperty() @Expose() isSynced: boolean;
    @ApiProperty() @Expose() createdAt: Date;
    @ApiProperty() @Expose() updatedAt: Date;
}
