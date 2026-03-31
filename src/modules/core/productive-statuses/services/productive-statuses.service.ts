import { Injectable } from '@nestjs/common';
import { CreateProductiveStatusDto } from '../dto/create-productive-status.dto';
import { UpdateProductiveStatusDto } from '../dto/update-productive-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductiveStatus } from '../entities/productive-status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductiveStatusesService {
	constructor(
		@InjectRepository(ProductiveStatus)
		private readonly productiveStatusesRepository: Repository<ProductiveStatus>
	){}
	create(createProductiveStatusDto: CreateProductiveStatusDto) {
		return 'This action adds a new productiveStatus';
	}

	findAll() {
		return `This action returns all productiveStatuses`;
	}

	findOne(id: number) {
		return `This action returns a #${id} productiveStatus`;
	}

	update(id: number, updateProductiveStatusDto: UpdateProductiveStatusDto) {
		return `This action updates a #${id} productiveStatus`;
	}

	remove(id: number) {
		return `This action removes a #${id} productiveStatus`;
	}
}
