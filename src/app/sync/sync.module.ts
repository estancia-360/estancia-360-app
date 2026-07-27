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
import { SyncDeletionsModule } from 'src/modules/core/sync-deletions/sync-deletions.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

import { BreedingModule } from 'src/app/breeding/breeding.module';
import { RearingModule } from 'src/app/rearing/rearing.module';
import { FatteningModule } from 'src/app/fattening/fattening.module';
import { AnimalHealthModule } from 'src/app/animal-health/animal-health.module';
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
        SyncDeletionsModule,
        RanchUsersModule,
        BreedingModule,
        RearingModule,
        FatteningModule,
        AnimalHealthModule,
        MovementsAppModule,
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
    ],
})
export class SyncModule {}
