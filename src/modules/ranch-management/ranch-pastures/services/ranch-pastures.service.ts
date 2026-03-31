import { Injectable } from '@nestjs/common';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RanchPasture } from '../entities/ranch-pasture.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RanchPasturesService {
	constructor(
		@InjectRepository(RanchPasture)
		private readonly ranchPasturesRepository: Repository<RanchPasture>
	){}
	create(createRanchPastureDto: CreateRanchPastureDto) {
		return 'This action adds a new ranchPasture';
	}

	findAll() {
		return `This action returns all ranchPastures`;
	}

	findOne(id: number) {
		return `This action returns a #${id} ranchPasture`;
	}

	update(id: number, updateRanchPastureDto: UpdateRanchPastureDto) {
		return `This action updates a #${id} ranchPasture`;
	}

	remove(id: number) {
		return `This action removes a #${id} ranchPasture`;
	}
}
