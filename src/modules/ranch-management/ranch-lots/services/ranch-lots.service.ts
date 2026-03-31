import { Injectable } from '@nestjs/common';
import { CreateRanchLotDto } from '../dto/create-ranch-lot.dto';
import { UpdateRanchLotDto } from '../dto/update-ranch-lot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RanchLot } from '../entities/ranch-lot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RanchLotsService {
	constructor(
		@InjectRepository(RanchLot)
		private readonly ranchLotsRepository: Repository<RanchLot>
	){}

	create(createRanchLotDto: CreateRanchLotDto) {
		return 'This action adds a new ranchLot';
	}

	findAll() {
		return `This action returns all ranchLots`;
	}

	findOne(id: number) {
		return `This action returns a #${id} ranchLot`;
	}

	update(id: number, updateRanchLotDto: UpdateRanchLotDto) {
		return `This action updates a #${id} ranchLot`;
	}

	remove(id: number) {
		return `This action removes a #${id} ranchLot`;
	}
}
