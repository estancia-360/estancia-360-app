import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AnimalDeclaredHistory } from '../entities/animal-declared-history.entity';
import { AnimalDeclaredHistoryDto } from '../dto/animal-declared-history.dto';
import { AnimalDeclaredHistoryNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';

@Injectable()
export class AnimalDeclaredHistoryService {
    private readonly repo: DtoRepository<AnimalDeclaredHistory>;

    constructor(
        @InjectRepository(AnimalDeclaredHistory)
        private readonly rawRepo: Repository<AnimalDeclaredHistory>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idRanchAnimal: number;
            prevBirthsCount?: number;
            prevLastBirthYear?: number;
            prevAvgWeaningWeight?: number;
            notes?: string;
            localId?: string;
        },
        manager?: EntityManager,
    ): Promise<AnimalDeclaredHistory> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.rawRepo;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const history = repo.create();
        history.idRanchAnimal = data.idRanchAnimal;
        if (data.prevBirthsCount !== undefined) history.prevBirthsCount = data.prevBirthsCount;
        if (data.prevLastBirthYear !== undefined) history.prevLastBirthYear = data.prevLastBirthYear;
        if (data.prevAvgWeaningWeight !== undefined) history.prevAvgWeaningWeight = data.prevAvgWeaningWeight;
        if (data.notes) history.notes = data.notes;
        if (data.localId) history.localId = data.localId;
        return await repo.save(history);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(AnimalDeclaredHistory)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new AnimalDeclaredHistoryNotFoundException(id);
        return result;
    }

    findOneByAnimalId<T>(dto: new () => T, idRanchAnimal: number, options: { throwException: false }): Promise<T | null>;
    findOneByAnimalId<T>(dto: new () => T, idRanchAnimal: number, options?: FindOptions): Promise<T>;
    async findOneByAnimalId<T>(dto: new () => T, idRanchAnimal: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { idRanchAnimal } });
        if (!result && throwException) {
            throw new AnimalDeclaredHistoryNotFoundException(idRanchAnimal);
        }
        return result;
    }

    async update(
        id: number,
        data: { prevBirthsCount?: number; prevLastBirthYear?: number; prevAvgWeaningWeight?: number; notes?: string },
        manager?: EntityManager,
    ): Promise<AnimalDeclaredHistory> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.rawRepo;
        const history = await repo.findOne({ where: { id } });
        if (!history) throw new AnimalDeclaredHistoryNotFoundException(id);
        if (data.prevBirthsCount !== undefined) history.prevBirthsCount = data.prevBirthsCount;
        if (data.prevLastBirthYear !== undefined) history.prevLastBirthYear = data.prevLastBirthYear;
        if (data.prevAvgWeaningWeight !== undefined) history.prevAvgWeaningWeight = data.prevAvgWeaningWeight;
        if (data.notes !== undefined) history.notes = data.notes;
        return await repo.save(history);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.rawRepo;
        await repo.delete({ id });
    }
}
