import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AnimalDeclaredHistory } from '../entities/animal-declared-history.entity';
import { CreateAnimalDeclaredHistoryDto } from '../dto/create-animal-declared-history.dto';
import { AnimalDeclaredHistoryDto } from '../dto/animal-declared-history.dto';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { MyNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class AnimalDeclaredHistoryService {
    constructor(
        @InjectRepository(AnimalDeclaredHistory)
        private readonly animalDeclaredHistoriesRepository: Repository<AnimalDeclaredHistory>,
    ) {}

    /**
     * Crea el historial declarado de un animal.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async create(data: CreateAnimalDeclaredHistoryDto, manager?: EntityManager): Promise<AnimalDeclaredHistory> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.animalDeclaredHistoriesRepository;
        const history = new AnimalDeclaredHistory();
        history.idRanchAnimal = data.idRanchAnimal;
        if (data.prevBirthsCount !== undefined) history.prevBirthsCount = data.prevBirthsCount;
        if (data.prevLastBirthYear !== undefined) history.prevLastBirthYear = data.prevLastBirthYear;
        if (data.prevAvgWeaningWeight !== undefined) history.prevAvgWeaningWeight = data.prevAvgWeaningWeight;
        if (data.notes) history.notes = data.notes;
        return await repo.save(history);
    }

    /**
     * Busca el historial declarado de un animal por su ID de animal.
     */
    async findOneByAnimalId<T>(
        idRanchAnimal: number,
        optionsData: OptionsFindDto<T, AnimalDeclaredHistory>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.animalDeclaredHistoriesRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (AnimalDeclaredHistoryDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const history = await repo.findOne({
            where: { idRanchAnimal },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!history && options.throwException) {
            throw new MyNotFoundException(`El historial declarado del animal con ID = ${idRanchAnimal} no fue encontrado.`);
        }
        if (!history) return null;
        return plainToInstance(templateClass, history, { excludeExtraneousValues: true });
    }

    /**
     * Elimina un historial declarado por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.animalDeclaredHistoriesRepository;
        await repo.delete({ id });
    }

    /**
     * Actualiza los campos editables del historial declarado.
     */
    async update(
        id: number,
        data: { prevBirthsCount?: number; prevLastBirthYear?: number; prevAvgWeaningWeight?: number; notes?: string },
        manager?: EntityManager,
    ): Promise<AnimalDeclaredHistory> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.animalDeclaredHistoriesRepository;
        const history = await repo.findOne({ where: { id } });
        if (!history) throw new MyNotFoundException(`El historial declarado con ID = ${id} no fue encontrado.`);
        if (data.prevBirthsCount !== undefined) history.prevBirthsCount = data.prevBirthsCount;
        if (data.prevLastBirthYear !== undefined) history.prevLastBirthYear = data.prevLastBirthYear;
        if (data.prevAvgWeaningWeight !== undefined) history.prevAvgWeaningWeight = data.prevAvgWeaningWeight;
        if (data.notes !== undefined) history.notes = data.notes;
        return await repo.save(history);
    }

    /**
     * Busca el historial declarado por su propio ID.
     */
    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, AnimalDeclaredHistory>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(AnimalDeclaredHistory) ?? this.animalDeclaredHistoriesRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (AnimalDeclaredHistoryDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const history = await repo.findOne({
            where: { id, ...(options.where ?? {}) },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!history && options.throwException) {
            throw new MyNotFoundException(`El historial declarado con ID = ${id} no fue encontrado.`);
        }
        if (!history) return null;
        return plainToInstance(templateClass, history, { excludeExtraneousValues: true });
    }
}
