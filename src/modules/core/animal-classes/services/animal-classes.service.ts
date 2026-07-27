import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalClass } from '../entities/animal-class.entity';
import { AnimalClassDto } from '../dto/animal-class.dto';
import { AnimalClassNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';

@Injectable()
export class AnimalClassesService {
    private readonly repo: DtoRepository<AnimalClass>;

    constructor(
        @InjectRepository(AnimalClass)
        private readonly rawRepo: Repository<AnimalClass>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async findAllActive(): Promise<AnimalClassDto[]> {
        return await this.repo.find({ dto: AnimalClassDto, where: { isActive: true }, order: { id: 'ASC' } });
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new AnimalClassNotFoundException(id);
        return result;
    }
}
