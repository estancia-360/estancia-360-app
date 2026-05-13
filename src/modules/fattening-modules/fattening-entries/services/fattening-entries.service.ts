import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FatteningEntry } from '../entities/fattening-entry.entity';
import { CreateFatteningEntryDto } from '../dto/create-fattening-entry.dto';
import { FatteningEntryDto } from '../dto/fattening-entry.dto';
import { FatteningEntryNotFoundException } from '../exceptions/fattening-entry-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class FatteningEntriesService {
    constructor(
        @InjectRepository(FatteningEntry)
        private readonly fatteningEntriesRepository: Repository<FatteningEntry>,
    ) {}

    async create(data: CreateFatteningEntryDto, manager?: EntityManager): Promise<FatteningEntry> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.fatteningEntriesRepository;
        const entry = new FatteningEntry();
        entry.idEvent = data.idEvent;
        entry.systemType = data.systemType;
        if (data.initialWeight !== undefined) entry.initialWeight = data.initialWeight;
        return await repo.save(entry);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, FatteningEntry>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.fatteningEntriesRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (FatteningEntryDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new FatteningEntryNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async update(id: number, data: { initialWeight?: number; systemType?: string }, manager?: EntityManager): Promise<FatteningEntry> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.fatteningEntriesRepository;
        const entry = await repo.findOne({ where: { id } });
        if (!entry) throw new FatteningEntryNotFoundException(id);
        if (data.initialWeight !== undefined) entry.initialWeight = data.initialWeight;
        if (data.systemType !== undefined) (entry as any).systemType = data.systemType;
        return await repo.save(entry);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.fatteningEntriesRepository;
        await repo.delete({ id });
    }

    async findOneByEventId(idEvent: number, manager?: EntityManager): Promise<FatteningEntry | null> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.fatteningEntriesRepository;
        return await repo.findOne({ where: { idEvent } }) ?? null;
    }

    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (FatteningEntryDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.fatteningEntriesRepository.findAndCount({
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
