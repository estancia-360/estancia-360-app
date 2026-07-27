import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalStatus } from '../entities/animal-status.entity';
import { AnimalStatusDto } from '../dto/animal-status.dto';
import { AnimalStatusNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';

@Injectable()
export class AnimalStatusesService {
    private readonly repo: DtoRepository<AnimalStatus>;

    constructor(
        @InjectRepository(AnimalStatus)
        private readonly rawRepo: Repository<AnimalStatus>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async findAllActive(): Promise<AnimalStatusDto[]> {
        return await this.repo.find({ dto: AnimalStatusDto, where: { isActive: true }, order: { id: 'ASC' } });
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id, isActive: true } });
        if (!result && throwException) throw new AnimalStatusNotFoundException(id);
        return result;
    }
}
