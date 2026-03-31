import { Injectable } from '@nestjs/common';
import { CreateEventTypeDto } from '../dto/create-event-type.dto';
import { UpdateEventTypeDto } from '../dto/update-event-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventType } from '../entities/event-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventTypesService {
	constructor(
		@InjectRepository(EventType)
		private readonly eventTypesRepository: Repository<EventType>
	){}

	create(createEventTypeDto: CreateEventTypeDto) {
		return 'This action adds a new eventType';
	}

	findAll() {
		return `This action returns all eventTypes`;
	}

	findOne(id: number) {
		return `This action returns a #${id} eventType`;
	}

	update(id: number, updateEventTypeDto: UpdateEventTypeDto) {
		return `This action updates a #${id} eventType`;
	}

	remove(id: number) {
		return `This action removes a #${id} eventType`;
	}
}
