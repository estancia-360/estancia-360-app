import { Injectable } from '@nestjs/common';
import { CreateAnimalDeclaredHistoryDto } from '../dto/create-animal-declared-history.dto';
import { UpdateAnimalDeclaredHistoryDto } from '../dto/update-animal-declared-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalDeclaredHistory } from '../entities/animal-declared-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnimalDeclaredHistoryService {
	constructor(
		@InjectRepository(AnimalDeclaredHistory)
		private readonly animalDeclaredHistoriesRepository: Repository<AnimalDeclaredHistory>
	){}

	create(createAnimalDeclaredHistoryDto: CreateAnimalDeclaredHistoryDto) {
		return 'This action adds a new animalDeclaredHistory';
	}

	findAll() {
		return `This action returns all animalDeclaredHistory`;
	}

	findOne(id: number) {
		return `This action returns a #${id} animalDeclaredHistory`;
	}

	update(id: number, updateAnimalDeclaredHistoryDto: UpdateAnimalDeclaredHistoryDto) {
		return `This action updates a #${id} animalDeclaredHistory`;
	}

	remove(id: number) {
		return `This action removes a #${id} animalDeclaredHistory`;
	}
}
