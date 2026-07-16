import { Module } from '@nestjs/common';
import { RanchAnimalsService } from './services/ranch-animals.service';
import { RanchAnimalsController } from './controllers/ranch-animals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchAnimal } from './entities/ranch-animal.entity';
import { AnimalStatusesModule } from '../animal-statuses/animal-statuses.module';
import { AnimalBreedsModule } from '../animal-breeds/animal-breeds.module';
import { RanchesModule } from '../ranches/ranches.module';
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
export class RanchAnimalsModule { }
