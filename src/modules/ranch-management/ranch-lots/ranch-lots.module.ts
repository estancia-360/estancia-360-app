import { Module } from '@nestjs/common';
import { RanchLotsService } from './services/ranch-lots.service';
import { RanchLotsController } from './controllers/ranch-lots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchLot } from './entities/ranch-lot.entity';
import { RanchesModule } from '../ranches/ranches.module';
import { RanchPasturesModule } from '../ranch-pastures/ranch-pastures.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([RanchLot]),
		RanchesModule,
		RanchPasturesModule,
	],
	controllers: [RanchLotsController],
	providers: [RanchLotsService],
	exports: [RanchLotsService],
})
export class RanchLotsModule { }
