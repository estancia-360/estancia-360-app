import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades que se necesitan para idempotencia (buscar por local_id)
import { RanchPasture } from 'src/modules/ranch-management/ranch-pastures/entities/ranch-pasture.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

// Módulos base (exponen sus servicios)
import { RanchPasturesModule } from 'src/modules/ranch-management/ranch-pastures/ranch-pastures.module';
import { RanchLotsModule } from 'src/modules/ranch-management/ranch-lots/ranch-lots.module';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';

// Módulos de CRÍA (exponen los use-cases via providers)
import { AnimalEventsModule } from 'src/modules/ranch-management/animal-events/animal-events.module';
import { BreedingServicesModule } from 'src/modules/breeding-modules/breeding-services/breeding-services.module';
import { GestationDiagnosesModule } from 'src/modules/breeding-modules/gestation-diagnoses/gestation-diagnoses.module';
import { ParturitionsModule } from 'src/modules/breeding-modules/parturitions/parturitions.module';
import { WeaningsModule } from 'src/modules/breeding-modules/weanings/weanings.module';
import { AnimalDeclaredHistoryModule } from 'src/modules/breeding-modules/animal-declared-history/animal-declared-history.module';

// Use-cases de CRÍA (los mismos del módulo breeding — sin duplicar lógica)
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

// Propios
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncCriaBatchUseCase } from './use-cases/sync-cria-batch.use-case';

@Module({
    imports: [
        // Repositorios directos para consultas de idempotencia (local_id)
        TypeOrmModule.forFeature([RanchPasture, RanchLot, RanchAnimal]),

        // Módulos base offline
        RanchPasturesModule,
        RanchLotsModule,
        RanchAnimalsModule,

        // Módulos de CRÍA (necesarios para los use-cases)
        AnimalEventsModule,
        BreedingServicesModule,
        GestationDiagnosesModule,
        ParturitionsModule,
        WeaningsModule,
        AnimalDeclaredHistoryModule,
    ],
    controllers: [SyncController],
    providers: [
        SyncService,
        SyncCriaBatchUseCase,

        // Use-cases de CRÍA — Register
        RegisterBreedingServiceUseCase,
        RegisterGestationDiagnosisUseCase,
        RegisterParturitionUseCase,
        RegisterWeaningUseCase,
        RegisterAnimalDeclaredHistoryUseCase,

        // Use-cases de CRÍA — Update
        UpdateBreedingServiceUseCase,
        UpdateGestationDiagnosisUseCase,
        UpdateParturitionUseCase,
        UpdateWeaningUseCase,
        UpdateAnimalDeclaredHistoryUseCase,

        // Use-cases de CRÍA — Delete
        DeleteBreedingServiceUseCase,
        DeleteGestationDiagnosisUseCase,
        DeleteParturitionUseCase,
        DeleteWeaningUseCase,
        DeleteAnimalDeclaredHistoryUseCase,
    ],
})
export class SyncModule { }
