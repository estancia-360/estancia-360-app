import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalBreed } from '../entities/animal-breed.entity';
import { AnimalBreedDto } from '../dto/animal-breed.dto';
import { AnimalBreedNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';

@Injectable()
export class AnimalBreedsService {
    private readonly repo: DtoRepository<AnimalBreed>;

    constructor(
        @InjectRepository(AnimalBreed)
        private readonly rawRepo: Repository<AnimalBreed>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async findAllActive(): Promise<AnimalBreedDto[]> {
        return await this.repo.find({ dto: AnimalBreedDto, where: { isActive: true }, order: { id: 'ASC' } });
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id, isActive: true } });
        if (!result && throwException) throw new AnimalBreedNotFoundException(id);
        return result;
    }
}
