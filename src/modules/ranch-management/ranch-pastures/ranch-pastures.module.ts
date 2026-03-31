import { Module } from '@nestjs/common';
import { RanchPasturesService } from './services/ranch-pastures.service';
import { RanchPasturesController } from './controllers/ranch-pastures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchPasture } from './entities/ranch-pasture.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([RanchPasture]),
	],
	controllers: [RanchPasturesController],
	providers: [RanchPasturesService],
})
export class RanchPasturesModule { }
