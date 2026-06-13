import { Module } from '@nestjs/common';
import { BreedingService } from './breeding.service';
import { BreedingController } from './breeding.controller';

// Register use-cases
import { RegisterBreedingServiceUseCase } from './use-cases/register-breeding-service.use-case';
import { RegisterGestationDiagnosisUseCase } from './use-cases/register-gestation-diagnosis.use-case';
import { RegisterParturitionUseCase } from './use-cases/register-parturition.use-case';
import { RegisterWeaningUseCase } from './use-cases/register-weaning.use-case';
import { SyncBreedingBatchUseCase } from './use-cases/sync-breeding-batch.use-case';
import { RegisterAnimalDeclaredHistoryUseCase } from './use-cases/register-animal-declared-history.use-case';

// Update use-cases
import { UpdateBreedingServiceUseCase } from './use-cases/update-breeding-service.use-case';
import { UpdateGestationDiagnosisUseCase } from './use-cases/update-gestation-diagnosis.use-case';
import { UpdateParturitionUseCase } from './use-cases/update-parturition.use-case';
import { UpdateWeaningUseCase } from './use-cases/update-weaning.use-case';
import { UpdateAnimalDeclaredHistoryUseCase } from './use-cases/update-animal-declared-history.use-case';

// Delete use-cases
import { DeleteBreedingServiceUseCase } from './use-cases/delete-breeding-service.use-case';
import { DeleteGestationDiagnosisUseCase } from './use-cases/delete-gestation-diagnosis.use-case';
import { DeleteParturitionUseCase } from './use-cases/delete-parturition.use-case';
import { DeleteWeaningUseCase } from './use-cases/delete-weaning.use-case';
import { DeleteAnimalDeclaredHistoryUseCase } from './use-cases/delete-animal-declared-history.use-case';

// Module dependencies
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { AnimalEventsModule } from 'src/modules/ranch-management/animal-events/animal-events.module';
import { RanchLotsModule } from 'src/modules/ranch-management/ranch-lots/ranch-lots.module';
import { BreedingServicesModule } from 'src/modules/breeding-modules/breeding-services/breeding-services.module';
import { GestationDiagnosesModule } from 'src/modules/breeding-modules/gestation-diagnoses/gestation-diagnoses.module';
import { ParturitionsModule } from 'src/modules/breeding-modules/parturitions/parturitions.module';
import { WeaningsModule } from 'src/modules/breeding-modules/weanings/weanings.module';
import { AnimalDeclaredHistoryModule } from 'src/modules/breeding-modules/animal-declared-history/animal-declared-history.module';
import { SyncDeletionsModule } from 'src/modules/core/sync-deletions/sync-deletions.module';

@Module({
    imports: [
        RanchAnimalsModule,
        AnimalEventsModule,
        RanchLotsModule,
        BreedingServicesModule,
        GestationDiagnosesModule,
        ParturitionsModule,
        WeaningsModule,
        AnimalDeclaredHistoryModule,
        SyncDeletionsModule,
    ],
    controllers: [BreedingController],
    providers: [
        BreedingService,
        // Register
        RegisterBreedingServiceUseCase,
        RegisterGestationDiagnosisUseCase,
        RegisterParturitionUseCase,
        RegisterWeaningUseCase,
        SyncBreedingBatchUseCase,
        RegisterAnimalDeclaredHistoryUseCase,
        // Update
        UpdateBreedingServiceUseCase,
        UpdateGestationDiagnosisUseCase,
        UpdateParturitionUseCase,
        UpdateWeaningUseCase,
        UpdateAnimalDeclaredHistoryUseCase,
        // Delete
        DeleteBreedingServiceUseCase,
        DeleteGestationDiagnosisUseCase,
        DeleteParturitionUseCase,
        DeleteWeaningUseCase,
        DeleteAnimalDeclaredHistoryUseCase,
    ],
})
export class BreedingModule {}
