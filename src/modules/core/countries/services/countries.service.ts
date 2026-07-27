import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { DtoRepository } from 'src/shared/orm';

@Injectable()
export class CountriesService {
    private readonly repo: DtoRepository<Country>;

    constructor(
        @InjectRepository(Country)
        rawRepo: Repository<Country>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async findAll<T>(dto: new () => T): Promise<T[]> {
        return this.repo.find({ dto, where: { isActive: true }, order: { id: 'ASC' } });
    }
}
