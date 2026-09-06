import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalEvent } from './entities/animal-event.entity';
import { AnimalEventsService } from './services/animal-events.service';
import { AnimalEventsController } from './controllers/animal-events.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalEvent]), RanchAnimalsModule, RanchUsersModule],
    controllers: [AnimalEventsController],
    providers: [AnimalEventsService],
    exports: [AnimalEventsService],
})
export class AnimalEventsModule {}
