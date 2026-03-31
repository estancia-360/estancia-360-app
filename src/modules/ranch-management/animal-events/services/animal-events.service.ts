import { Injectable } from '@nestjs/common';
import { CreateAnimalEventDto } from '../dto/create-animal-event.dto';
import { UpdateAnimalEventDto } from '../dto/update-animal-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalEvent } from '../entities/animal-event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnimalEventsService {
	constructor(
		@InjectRepository(AnimalEvent)
		private readonly animalEventsRepository: Repository<AnimalEvent>
	){}

	create(createAnimalEventDto: CreateAnimalEventDto) {
		return 'This action adds a new animalEvent';
	}

	findAll() {
		return `This action returns all animalEvents`;
	}

	findOne(id: number) {
		return `This action returns a #${id} animalEvent`;
	}

	update(id: number, updateAnimalEventDto: UpdateAnimalEventDto) {
		return `This action updates a #${id} animalEvent`;
	}

	remove(id: number) {
		return `This action removes a #${id} animalEvent`;
	}
}
