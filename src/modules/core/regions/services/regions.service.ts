import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { DtoRepository } from 'src/shared/orm';

@Injectable()
export class RegionsService {
    private readonly repo: DtoRepository<Region>;

    constructor(
        @InjectRepository(Region)
        rawRepo: Repository<Region>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async findAllByCountry<T>(dto: new () => T, idCountry: number): Promise<T[]> {
        return this.repo.find({ dto, where: { idCountry, isActive: true }, order: { id: 'ASC' } });
    }
}
