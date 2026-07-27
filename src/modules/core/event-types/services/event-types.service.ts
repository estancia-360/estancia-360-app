import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventType } from '../entities/event-type.entity';

@Injectable()
export class EventTypesService {
    constructor(
        @InjectRepository(EventType)
        private readonly rawRepo: Repository<EventType>,
    ) {}

    async findAll(): Promise<EventType[]> {
        return await this.rawRepo.find();
    }
}
