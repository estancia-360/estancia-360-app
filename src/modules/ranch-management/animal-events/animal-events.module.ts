import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalEvent } from './entities/animal-event.entity';
import { AnimalEventsService } from './services/animal-events.service';
import { AnimalEventsController } from './controllers/animal-events.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalEvent])],
    controllers: [AnimalEventsController],
    providers: [AnimalEventsService],
    exports: [AnimalEventsService],
})
export class AnimalEventsModule {}
