import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AnimalExit, ExitReasonEnum } from '../entities/animal-exit.entity';
import { AnimalExitDto } from '../dto/animal-exit.dto';
import { AnimalExitNotFoundException } from '../exceptions/animal-exit-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class AnimalExitsService {
    constructor(
        @InjectRepository(AnimalExit)
        private readonly animalExitsRepository: Repository<AnimalExit>,
    ) {}

    async create(data: {
        idEvent: number;
        reason: ExitReasonEnum;
        notes?: string;
        localId?: string;
    }, manager?: EntityManager): Promise<AnimalExit> {
        const repo = manager?.getRepository(AnimalExit) ?? this.animalExitsRepository;
        const exit = new AnimalExit();
        exit.idEvent = data.idEvent;
        exit.reason = data.reason;
        exit.notes = data.notes;
        exit.localId = data.localId;
        return await repo.save(exit);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, AnimalExit>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(AnimalExit) ?? this.animalExitsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (AnimalExitDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new AnimalExitNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async findOneByLocalId(localId: string, manager?: EntityManager): Promise<AnimalExit | null> {
        const repo = manager?.getRepository(AnimalExit) ?? this.animalExitsRepository;
        return await repo.findOne({ where: { localId } }) ?? null;
    }

    async update(id: number, data: { reason?: ExitReasonEnum; notes?: string }, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(AnimalExit) ?? this.animalExitsRepository;
        const exit = await repo.findOne({ where: { id } });
        if (!exit) throw new AnimalExitNotFoundException(id);
        if (data.reason !== undefined) exit.reason = data.reason;
        if (data.notes !== undefined) exit.notes = data.notes;
        await repo.save(exit);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(AnimalExit) ?? this.animalExitsRepository;
        await repo.delete({ id });
    }

    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (AnimalExitDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.animalExitsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: { event: { idRanchAnimal } },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: plainToInstance(templateClass, records, { excludeExtraneousValues: true }),
            meta: { page, limit, pages: Math.ceil(total / limit), total },
        };
    }
}
