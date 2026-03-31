import { Injectable } from '@nestjs/common';
import { CreateBreedingServiceDto } from '../dto/create-breeding-service.dto';
import { UpdateBreedingServiceDto } from '../dto/update-breeding-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BreedingService } from '../entities/breeding-service.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BreedingServicesService {
	constructor(
		@InjectRepository(BreedingService)
		private readonly breedingServicesRepository: Repository<BreedingService>
	){}

	create(createBreedingServiceDto: CreateBreedingServiceDto) {
		return 'This action adds a new breedingService';
	}

	findAll() {
		return `This action returns all breedingServices`;
	}

	findOne(id: number) {
		return `This action returns a #${id} breedingService`;
	}

	update(id: number, updateBreedingServiceDto: UpdateBreedingServiceDto) {
		return `This action updates a #${id} breedingService`;
	}

	remove(id: number) {
		return `This action removes a #${id} breedingService`;
	}
}
