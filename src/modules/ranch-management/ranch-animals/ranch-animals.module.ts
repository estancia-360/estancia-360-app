import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchAnimal } from './entities/ranch-animal.entity';
import { RanchAnimalsService } from './services/ranch-animals.service';
import { RanchAnimalsController } from './controllers/ranch-animals.controller';
import { RanchesModule } from 'src/modules/ranch-management/ranches/ranches.module';
import { AnimalStatusesModule } from 'src/modules/ranch-management/animal-statuses/animal-statuses.module';
import { AnimalBreedsModule } from 'src/modules/ranch-management/animal-breeds/animal-breeds.module';
import { AnimalClassesModule } from 'src/modules/core/animal-classes/animal-classes.module';
import { RanchSubscriptionsModule } from 'src/modules/payment-modules/ranch-subscriptions/ranch-subscriptions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([RanchAnimal]),
        RanchesModule,
        AnimalStatusesModule,
        AnimalBreedsModule,
        AnimalClassesModule,
        RanchSubscriptionsModule,
    ],
    controllers: [RanchAnimalsController],
    providers: [RanchAnimalsService],
    exports: [RanchAnimalsService],
})
export class RanchAnimalsModule {}
