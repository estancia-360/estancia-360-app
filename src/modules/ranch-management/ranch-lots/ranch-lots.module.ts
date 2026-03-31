import { Module } from '@nestjs/common';
import { RanchLotsService } from './services/ranch-lots.service';
import { RanchLotsController } from './controllers/ranch-lots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchLot } from './entities/ranch-lot.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([RanchLot])
	],
	controllers: [RanchLotsController],
	providers: [RanchLotsService],
})
export class RanchLotsModule { }
