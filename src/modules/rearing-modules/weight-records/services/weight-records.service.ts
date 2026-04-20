import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WeightRecord } from '../entities/weight-record.entity';
import { CreateWeightRecordDto } from '../dto/create-weight-record.dto';
import { UpdateWeightRecordDto } from '../dto/update-weight-record.dto';
import { WeightRecordDto } from '../dto/weight-record.dto';
import { WeightRecordNotFoundException } from '../exceptions/weight-record-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class WeightRecordsService {
    constructor(
        @InjectRepository(WeightRecord)
        private readonly weightRecordsRepository: Repository<WeightRecord>,
    ) {}

    async create(data: CreateWeightRecordDto, manager?: EntityManager): Promise<WeightRecord> {
        const repo = manager?.getRepository(WeightRecord) ?? this.weightRecordsRepository;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const record = new WeightRecord();
        record.idEvent = data.idEvent;
        record.idLot = data.idLot;
        record.weight = data.weight;
        record.weightType = data.weightType;
        if (data.localId !== undefined) record.localId = data.localId;
        if (data.bodyCondition !== undefined) record.bodyCondition = data.bodyCondition;
        if (data.ageDays !== undefined) record.ageDays = data.ageDays;
        if (data.notes !== undefined) record.notes = data.notes;
        return await repo.save(record);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, WeightRecord>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(WeightRecord) ?? this.weightRecordsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (WeightRecordDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id, ...(options.where ?? {}) },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new WeightRecordNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async update(id: number, data: UpdateWeightRecordDto, manager?: EntityManager): Promise<WeightRecord> {
        const repo = manager?.getRepository(WeightRecord) ?? this.weightRecordsRepository;
        const record = await repo.findOne({ where: { id } });
        if (!record) throw new WeightRecordNotFoundException(id);
        if (data.weight !== undefined) record.weight = data.weight;
        if (data.weightType !== undefined) record.weightType = data.weightType;
        if (data.bodyCondition !== undefined) record.bodyCondition = data.bodyCondition;
        if (data.ageDays !== undefined) record.ageDays = data.ageDays;
        if (data.notes !== undefined) record.notes = data.notes;
        return await repo.save(record);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(WeightRecord) ?? this.weightRecordsRepository;
        await repo.delete({ id });
    }

    async findOneByEventId(idEvent: number, manager?: EntityManager): Promise<WeightRecord | null> {
        const repo = manager?.getRepository(WeightRecord) ?? this.weightRecordsRepository;
        return await repo.findOne({ where: { idEvent } }) ?? null;
    }

    async findPreviousByAnimal(idRanchAnimal: number, beforeEventDate: Date, manager?: EntityManager): Promise<WeightRecord | null> {
        const repo = manager?.getRepository(WeightRecord) ?? this.weightRecordsRepository;
        return await repo.createQueryBuilder('wr')
            .innerJoin('wr.event', 'ev')
            .where('ev.idRanchAnimal = :idRanchAnimal', { idRanchAnimal })
            .andWhere('ev.eventDate < :beforeEventDate', { beforeEventDate })
            .orderBy('ev.eventDate', 'DESC')
            .getOne() ?? null;
    }

    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (WeightRecordDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.weightRecordsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: { event: { idRanchAnimal } },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'ASC' },
        });
        return {
            data: plainToInstance(templateClass, records, { excludeExtraneousValues: true }),
            meta: { page, limit, pages: Math.ceil(total / limit), total },
        };
    }

    async findAllByLot<T>(
        idLot: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (WeightRecordDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.weightRecordsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: { idLot },
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
