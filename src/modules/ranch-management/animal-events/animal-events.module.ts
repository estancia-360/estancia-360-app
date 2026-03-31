import { Module } from '@nestjs/common';
import { AnimalEventsService } from './services/animal-events.service';
import { AnimalEventsController } from './controllers/animal-events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalEvent } from './entities/animal-event.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([AnimalEvent]),
	],
	controllers: [AnimalEventsController],
	providers: [AnimalEventsService],
})
export class AnimalEventsModule { }
