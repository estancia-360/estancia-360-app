import { Module } from '@nestjs/common';
import { RanchesService } from './services/ranches.service';
import { RanchesController } from './controllers/ranches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranch } from './entities/ranch.entity';
import { CitiesModule } from 'src/modules/core/cities/cities.module';
import { ProductionTypesModule } from 'src/modules/core/production-types/production-types.module';
import { RanchUsersModule } from '../ranch-users/ranch-users.module';
import { UsersModule } from 'src/modules/user-management/users/users.module';
import { RanchProductionType } from '../ranch-production-types/entities/ranch-production-type.entity';
import { RanchSubscriptionsModule } from 'src/modules/payment-modules/ranch-subscriptions/ranch-subscriptions.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Ranch, RanchProductionType]),
		CitiesModule,
		ProductionTypesModule,
		RanchUsersModule,
		UsersModule,
		RanchSubscriptionsModule,
	],
	controllers: [RanchesController],
	providers: [RanchesService],
	exports: [RanchesService]
})
export class RanchesModule { }
