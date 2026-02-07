import { Module } from '@nestjs/common';
import { AnimalStatusesService } from './services/animal-statuses.service';
import { AnimalStatusesController } from './controllers/animal-statuses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalStatus } from './entities/animal-status.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([AnimalStatus])
	],
	controllers: [AnimalStatusesController],
	providers: [AnimalStatusesService],
	exports: [AnimalStatusesService],
})
export class AnimalStatusesModule { }
