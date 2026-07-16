import { Module } from '@nestjs/common';
import { MovementsAppService } from './movements-app.service';
import { MovementsAppController } from './movements-app.controller';
import { RegisterMovementUseCase } from './use-cases/register-movement.use-case';
import { ConfirmMovementAnimalUseCase } from './use-cases/confirm-movement-animal.use-case';
import { CancelMovementUseCase } from './use-cases/cancel-movement.use-case';
import { RegisterAnimalExitUseCase } from './use-cases/register-animal-exit.use-case';
import { UpdateAnimalExitUseCase } from './use-cases/update-animal-exit.use-case';
import { MovementsModule } from 'src/modules/movement-modules/movements/movements.module';
import { MovementAnimalsModule } from 'src/modules/movement-modules/movement-animals/movement-animals.module';
import { AnimalExitsModule } from 'src/modules/movement-modules/animal-exits/animal-exits.module';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { AnimalEventsModule } from 'src/modules/ranch-management/animal-events/animal-events.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';
import { TreatmentsModule } from 'src/modules/health-modules/treatments/treatments.module';
import { RanchSubscriptionsModule } from 'src/modules/payment-modules/ranch-subscriptions/ranch-subscriptions.module';

@Module({
    imports: [
        MovementsModule,
        MovementAnimalsModule,
        AnimalExitsModule,
        RanchAnimalsModule,
        AnimalEventsModule,
        RanchUsersModule,
        TreatmentsModule,
        RanchSubscriptionsModule,
    ],
    controllers: [MovementsAppController],
    providers: [
        MovementsAppService,
        RegisterMovementUseCase,
        ConfirmMovementAnimalUseCase,
        CancelMovementUseCase,
        RegisterAnimalExitUseCase,
        UpdateAnimalExitUseCase,
    ],
    exports: [
        RegisterMovementUseCase,
        ConfirmMovementAnimalUseCase,
        CancelMovementUseCase,
        RegisterAnimalExitUseCase,
        UpdateAnimalExitUseCase,
    ],
})
export class MovementsAppModule {}
