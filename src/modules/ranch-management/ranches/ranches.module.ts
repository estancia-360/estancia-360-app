import { Module } from '@nestjs/common';
import { RanchesService } from './services/ranches.service';
import { RanchesController } from './controllers/ranches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranch } from './entities/ranch.entity';
import { CitiesModule } from 'src/modules/core/cities/cities.module';
import { ProductionTypesModule } from 'src/modules/core/production-types/production-types.module';
import { RanchUsersModule } from '../ranch-users/ranch-users.module';
import { UsersModule } from 'src/modules/user-management/users/users.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Ranch]),
		CitiesModule,
		ProductionTypesModule,
		RanchUsersModule,
		UsersModule,
	],
	controllers: [RanchesController],
	providers: [RanchesService],
	exports: [RanchesService]
})
export class RanchesModule { }
