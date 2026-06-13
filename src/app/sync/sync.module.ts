import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RanchPasture } from 'src/modules/ranch-management/ranch-pastures/entities/ranch-pasture.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { BreedingService as BreedingServiceEntity } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';
import { GestationDiagnosis } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';
import { Parturition } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';
import { Weaning } from 'src/modules/breeding-modules/weanings/entities/weaning.entity';
import { AnimalDeclaredHistory } from 'src/modules/breeding-modules/animal-declared-history/entities/animal-declared-history.entity';
import { WeightRecord } from 'src/modules/rearing-modules/weight-records/entities/weight-record.entity';
import { RearingSelection } from 'src/modules/rearing-modules/rearing-selections/entities/rearing-selection.entity';
import { FatteningEntry } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';
import { FeedRecord } from 'src/modules/fattening-modules/feed-records/entities/feed-record.entity';
import { AnimalClass } from 'src/modules/core/animal-classes/entities/animal-class.entity';
import { AnimalBreed } from 'src/modules/ranch-management/animal-breeds/entities/animal-breed.entity';
import { AnimalStatus } from 'src/modules/ranch-management/animal-statuses/entities/animal-status.entity';
import { EventType } from 'src/modules/core/event-types/entities/event-type.entity';
import { ProductiveStatus } from 'src/modules/core/productive-statuses/entities/productive-status.entity';
import { ProductionType } from 'src/modules/core/production-types/entities/production-type.entity';

import { RanchPasturesModule } from 'src/modules/ranch-management/ranch-pastures/ranch-pastures.module';
import { RanchLotsModule } from 'src/modules/ranch-management/ranch-lots/ranch-lots.module';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { AnimalEventsModule } from 'src/modules/ranch-management/animal-events/animal-events.module';
import { BreedingServicesModule } from 'src/modules/breeding-modules/breeding-services/breeding-services.module';
import { GestationDiagnosesModule } from 'src/modules/breeding-modules/gestation-diagnoses/gestation-diagnoses.module';
import { ParturitionsModule } from 'src/modules/breeding-modules/parturitions/parturitions.module';
import { WeaningsModule } from 'src/modules/breeding-modules/weanings/weanings.module';
import { AnimalDeclaredHistoryModule } from 'src/modules/breeding-modules/animal-declared-history/animal-declared-history.module';
import { WeightRecordsModule } from 'src/modules/rearing-modules/weight-records/weight-records.module';
import { RearingSelectionsModule } from 'src/modules/rearing-modules/rearing-selections/rearing-selections.module';
import { FatteningEntriesModule } from 'src/modules/fattening-modules/fattening-entries/fattening-entries.module';
import { FeedRecordsModule } from 'src/modules/fattening-modules/feed-records/feed-records.module';
import { SyncDeletionsModule } from 'src/modules/core/sync-deletions/sync-deletions.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

import { RegisterBreedingServiceUseCase } from 'src/app/breeding/use-cases/register-breeding-service.use-case';
import { RegisterGestationDiagnosisUseCase } from 'src/app/breeding/use-cases/register-gestation-diagnosis.use-case';
import { RegisterParturitionUseCase } from 'src/app/breeding/use-cases/register-parturition.use-case';
import { RegisterWeaningUseCase } from 'src/app/breeding/use-cases/register-weaning.use-case';
import { RegisterAnimalDeclaredHistoryUseCase } from 'src/app/breeding/use-cases/register-animal-declared-history.use-case';
import { UpdateBreedingServiceUseCase } from 'src/app/breeding/use-cases/update-breeding-service.use-case';
import { UpdateGestationDiagnosisUseCase } from 'src/app/breeding/use-cases/update-gestation-diagnosis.use-case';
import { UpdateParturitionUseCase } from 'src/app/breeding/use-cases/update-parturition.use-case';
import { UpdateWeaningUseCase } from 'src/app/breeding/use-cases/update-weaning.use-case';
import { UpdateAnimalDeclaredHistoryUseCase } from 'src/app/breeding/use-cases/update-animal-declared-history.use-case';
import { DeleteBreedingServiceUseCase } from 'src/app/breeding/use-cases/delete-breeding-service.use-case';
import { DeleteGestationDiagnosisUseCase } from 'src/app/breeding/use-cases/delete-gestation-diagnosis.use-case';
import { DeleteParturitionUseCase } from 'src/app/breeding/use-cases/delete-parturition.use-case';
import { DeleteWeaningUseCase } from 'src/app/breeding/use-cases/delete-weaning.use-case';
import { DeleteAnimalDeclaredHistoryUseCase } from 'src/app/breeding/use-cases/delete-animal-declared-history.use-case';

import { RegisterWeightRecordUseCase } from 'src/app/rearing/use-cases/register-weight-record.use-case';
import { UpdateWeightRecordUseCase } from 'src/app/rearing/use-cases/update-weight-record.use-case';
import { DeleteWeightRecordUseCase } from 'src/app/rearing/use-cases/delete-weight-record.use-case';
import { RegisterRearingSelectionUseCase } from 'src/app/rearing/use-cases/register-rearing-selection.use-case';
import { UpdateRearingSelectionUseCase } from 'src/app/rearing/use-cases/update-rearing-selection.use-case';
import { DeleteRearingSelectionUseCase } from 'src/app/rearing/use-cases/delete-rearing-selection.use-case';

import { RegisterFeedRecordUseCase } from 'src/app/fattening/use-cases/register-feed-record.use-case';
import { UpdateFeedRecordUseCase } from 'src/app/fattening/use-cases/update-feed-record.use-case';
import { DeleteFeedRecordUseCase } from 'src/app/fattening/use-cases/delete-feed-record.use-case';

import { SyncService } from './sync.service';
import { SyncDownloadService } from './services/sync-download.service';
import { SyncController } from './sync.controller';
import { SyncCriaBatchUseCase } from './use-cases/sync-cria-batch.use-case';
import { SyncRecriaBatchUseCase } from './use-cases/sync-recria-batch.use-case';
import { SyncEngordeBatchUseCase } from './use-cases/sync-engorde-batch.use-case';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RanchPasture,
            RanchLot,
            RanchAnimal,
            AnimalEvent,
            BreedingServiceEntity,
            GestationDiagnosis,
            Parturition,
            Weaning,
            AnimalDeclaredHistory,
            WeightRecord,
            RearingSelection,
            FatteningEntry,
            FeedRecord,
            AnimalClass,
            AnimalBreed,
            AnimalStatus,
            EventType,
            ProductiveStatus,
            ProductionType,
        ]),
        RanchPasturesModule,
        RanchLotsModule,
        RanchAnimalsModule,
        AnimalEventsModule,
        BreedingServicesModule,
        GestationDiagnosesModule,
        ParturitionsModule,
        WeaningsModule,
        AnimalDeclaredHistoryModule,
        WeightRecordsModule,
        RearingSelectionsModule,
        FatteningEntriesModule,
        FeedRecordsModule,
        SyncDeletionsModule,
        RanchUsersModule,
    ],
    controllers: [SyncController],
    providers: [
        SyncService,
        SyncDownloadService,
        SyncCriaBatchUseCase,
        SyncRecriaBatchUseCase,
        SyncEngordeBatchUseCase,

        // Use-cases RECRÍA
        RegisterWeightRecordUseCase,
        UpdateWeightRecordUseCase,
        DeleteWeightRecordUseCase,
        RegisterRearingSelectionUseCase,
        UpdateRearingSelectionUseCase,
        DeleteRearingSelectionUseCase,

        // Use-cases ENGORDE
        RegisterFeedRecordUseCase,
        UpdateFeedRecordUseCase,
        DeleteFeedRecordUseCase,

        // Use-cases CRÍA
        RegisterBreedingServiceUseCase,
        RegisterGestationDiagnosisUseCase,
        RegisterParturitionUseCase,
        RegisterWeaningUseCase,
        RegisterAnimalDeclaredHistoryUseCase,
        UpdateBreedingServiceUseCase,
        UpdateGestationDiagnosisUseCase,
        UpdateParturitionUseCase,
        UpdateWeaningUseCase,
        UpdateAnimalDeclaredHistoryUseCase,
        DeleteBreedingServiceUseCase,
        DeleteGestationDiagnosisUseCase,
        DeleteParturitionUseCase,
        DeleteWeaningUseCase,
        DeleteAnimalDeclaredHistoryUseCase,
    ],
})
export class SyncModule {}
