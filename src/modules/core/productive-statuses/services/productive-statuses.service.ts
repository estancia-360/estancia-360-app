import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductiveStatus } from '../entities/productive-status.entity';

@Injectable()
export class ProductiveStatusesService {
    constructor(
        @InjectRepository(ProductiveStatus)
        private readonly rawRepo: Repository<ProductiveStatus>,
    ) {}

    async findAll(): Promise<ProductiveStatus[]> {
        return await this.rawRepo.find();
    }
}
