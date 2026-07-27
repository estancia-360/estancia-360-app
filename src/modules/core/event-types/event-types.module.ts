import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventType } from './entities/event-type.entity';
import { EventTypesService } from './services/event-types.service';

@Module({
    imports:   [TypeOrmModule.forFeature([EventType])],
    providers: [EventTypesService],
    exports:   [EventTypesService],
})
export class EventTypesModule {}
