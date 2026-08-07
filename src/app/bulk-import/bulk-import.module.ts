import { Module } from '@nestjs/common';
import { BulkImportController } from './bulk-import.controller';

import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';
import { RearingModule } from 'src/app/rearing/rearing.module';
import { BreedingModule } from 'src/app/breeding/breeding.module';
import { BreedingServicesModule } from 'src/modules/breeding-modules/breeding-services/breeding-services.module';
import { AnimalHealthModule } from 'src/app/animal-health/animal-health.module';
import { MovementsAppModule } from 'src/app/movements/movements-app.module';

import { BulkImportAnimalsUseCase } from './use-cases/bulk-import-animals.use-case';
import { BulkImportWeightsUseCase } from './use-cases/bulk-import-weights.use-case';
import { BulkImportGestationUseCase } from './use-cases/bulk-import-gestation.use-case';
import { BulkImportHealthUseCase } from './use-cases/bulk-import-health.use-case';
import { BulkImportMovementsUseCase } from './use-cases/bulk-import-movements.use-case';

@Module({
    imports: [
        RanchAnimalsModule,
        RanchUsersModule,
        RearingModule,
        BreedingModule,
        BreedingServicesModule,
        AnimalHealthModule,
        MovementsAppModule,
    ],
    controllers: [BulkImportController],
    providers: [
        BulkImportAnimalsUseCase,
        BulkImportWeightsUseCase,
        BulkImportGestationUseCase,
        BulkImportHealthUseCase,
        BulkImportMovementsUseCase,
    ],
})
export class BulkImportModule {}
