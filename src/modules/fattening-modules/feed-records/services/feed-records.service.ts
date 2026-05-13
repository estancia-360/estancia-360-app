import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FeedRecord } from '../entities/feed-record.entity';
import { CreateFeedRecordDto } from '../dto/create-feed-record.dto';
import { UpdateFeedRecordDto } from '../dto/update-feed-record.dto';
import { FeedRecordDto } from '../dto/feed-record.dto';
import { FeedRecordNotFoundException } from '../exceptions/feed-record-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class FeedRecordsService {
    constructor(
        @InjectRepository(FeedRecord)
        private readonly feedRecordsRepository: Repository<FeedRecord>,
    ) {}

    async create(data: CreateFeedRecordDto, manager?: EntityManager): Promise<FeedRecord> {
        const repo = manager?.getRepository(FeedRecord) ?? this.feedRecordsRepository;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const record = new FeedRecord();
        record.idLot = data.idLot;
        if (data.idUser) record.idUser = data.idUser;
        record.feedDate = data.feedDate;
        record.feedType = data.feedType;
        if (data.quantity !== undefined) record.quantity = data.quantity;
        if (data.unit !== undefined) record.unit = data.unit;
        if (data.cost !== undefined) record.cost = data.cost;
        if (data.notes !== undefined) record.notes = data.notes;
        if (data.localId !== undefined) record.localId = data.localId;
        record.isSynced = data.isSynced ?? false;
        return await repo.save(record);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, FeedRecord>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(FeedRecord) ?? this.feedRecordsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (FeedRecordDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id, ...(options.where ?? {}) },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new FeedRecordNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async update(id: number, data: UpdateFeedRecordDto, manager?: EntityManager): Promise<FeedRecord> {
        const repo = manager?.getRepository(FeedRecord) ?? this.feedRecordsRepository;
        const record = await repo.findOne({ where: { id } });
        if (!record) throw new FeedRecordNotFoundException(id);
        if (data.feedType !== undefined) record.feedType = data.feedType;
        if (data.quantity !== undefined) record.quantity = data.quantity;
        if (data.unit !== undefined) record.unit = data.unit;
        if (data.cost !== undefined) record.cost = data.cost;
        if (data.notes !== undefined) record.notes = data.notes;
        return await repo.save(record);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(FeedRecord) ?? this.feedRecordsRepository;
        const record = await repo.findOne({ where: { id } });
        if (!record) throw new FeedRecordNotFoundException(id);
        await repo.delete({ id });
    }

    async findAllByLot<T>(
        idLot: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (FeedRecordDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.feedRecordsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: { idLot },
            skip: (page - 1) * limit,
            take: limit,
            order: { feedDate: 'DESC' },
        });
        return {
            data: plainToInstance(templateClass, records, { excludeExtraneousValues: true }),
            meta: { page, limit, pages: Math.ceil(total / limit), total },
        };
    }
}
