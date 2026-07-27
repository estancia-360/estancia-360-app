import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';
import { CityNotFoundException } from '../exceptions';

@Injectable()
export class CitiesService {
    private readonly repo: DtoRepository<City>;

    constructor(
        @InjectRepository(City)
        rawRepo: Repository<City>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async findAllByRegion<T>(dto: new () => T, idRegion: number): Promise<T[]> {
        return this.repo.find({ dto, where: { idRegion, isActive: true }, order: { id: 'ASC' } });
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const city = await this.repo.findOne({ dto, where: { id, isActive: true } });
        if (!city && throwException) throw new CityNotFoundException();
        return city;
    }
}
