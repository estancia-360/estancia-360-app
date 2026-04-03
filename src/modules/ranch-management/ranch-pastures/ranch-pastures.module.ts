import { Module } from '@nestjs/common';
import { RanchPasturesService } from './services/ranch-pastures.service';
import { RanchPasturesController } from './controllers/ranch-pastures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchPasture } from './entities/ranch-pasture.entity';
import { RanchesModule } from '../ranches/ranches.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([RanchPasture]),
		RanchesModule,
	],
	controllers: [RanchPasturesController],
	providers: [RanchPasturesService],
	exports: [RanchPasturesService],
})
export class RanchPasturesModule { }
