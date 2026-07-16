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
import { Vaccination } from 'src/modules/health-modules/vaccinations/entities/vaccination.entity';
import { Treatment } from 'src/modules/health-modules/treatments/entities/treatment.entity';
import { HealthIncident } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';
import { Movement } from 'src/modules/movement-modules/movements/entities/movement.entity';
import { MovementAnimal } from 'src/modules/movement-modules/movement-animals/entities/movement-animal.entity';
import { AnimalExit } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';
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
import { VaccinationsModule } from 'src/modules/health-modules/vaccinations/vaccinations.module';
import { TreatmentsModule } from 'src/modules/health-modules/treatments/treatments.module';
import { HealthIncidentsModule } from 'src/modules/health-modules/health-incidents/health-incidents.module';
import { SyncDeletionsModule } from 'src/modules/core/sync-deletions/sync-deletions.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';
import { RanchSubscriptionsModule } from 'src/modules/payment-modules/ranch-subscriptions/ranch-subscriptions.module';

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

import { RegisterVaccinationUseCase } from 'src/app/health/use-cases/register-vaccination.use-case';
import { UpdateVaccinationUseCase } from 'src/app/health/use-cases/update-vaccination.use-case';
import { DeleteVaccinationUseCase } from 'src/app/health/use-cases/delete-vaccination.use-case';
import { RegisterTreatmentUseCase } from 'src/app/health/use-cases/register-treatment.use-case';
import { UpdateTreatmentUseCase } from 'src/app/health/use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from 'src/app/health/use-cases/delete-treatment.use-case';
import { RegisterHealthIncidentUseCase } from 'src/app/health/use-cases/register-health-incident.use-case';
import { UpdateHealthIncidentUseCase } from 'src/app/health/use-cases/update-health-incident.use-case';
import { DeleteHealthIncidentUseCase } from 'src/app/health/use-cases/delete-health-incident.use-case';

import { MovementsAppModule } from 'src/app/movements/movements-app.module';

import { SyncService } from './sync.service';
import { SyncDownloadService } from './services/sync-download.service';
import { SyncController } from './sync.controller';
import { SyncCriaBatchUseCase } from './use-cases/sync-cria-batch.use-case';
import { SyncRecriaBatchUseCase } from './use-cases/sync-recria-batch.use-case';
import { SyncEngordeBatchUseCase } from './use-cases/sync-engorde-batch.use-case';
import { SyncSanidadBatchUseCase } from './use-cases/sync-sanidad-batch.use-case';
import { SyncMovimientosBatchUseCase } from './use-cases/sync-movimientos-batch.use-case';

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
            Vaccination,
            Treatment,
            HealthIncident,
            Movement,
            MovementAnimal,
            AnimalExit,
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
        VaccinationsModule,
        TreatmentsModule,
        HealthIncidentsModule,
        SyncDeletionsModule,
        RanchUsersModule,
        MovementsAppModule,
        RanchSubscriptionsModule,
    ],
    controllers: [SyncController],
    providers: [
        SyncService,
        SyncDownloadService,
        SyncCriaBatchUseCase,
        SyncRecriaBatchUseCase,
        SyncEngordeBatchUseCase,
        SyncSanidadBatchUseCase,
        SyncMovimientosBatchUseCase,

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

        // Use-cases SANIDAD
        RegisterVaccinationUseCase,
        UpdateVaccinationUseCase,
        DeleteVaccinationUseCase,
        RegisterTreatmentUseCase,
        UpdateTreatmentUseCase,
        DeleteTreatmentUseCase,
        RegisterHealthIncidentUseCase,
        UpdateHealthIncidentUseCase,
        DeleteHealthIncidentUseCase,

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
