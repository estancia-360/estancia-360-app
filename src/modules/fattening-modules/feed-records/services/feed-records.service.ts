import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FeedRecord } from '../entities/feed-record.entity';
import { FeedRecordDto } from '../dto/feed-record.dto';
import { FeedRecordNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class FeedRecordsService {
    private readonly repo: DtoRepository<FeedRecord>;

    constructor(
        @InjectRepository(FeedRecord)
        private readonly rawRepo: Repository<FeedRecord>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idLot: number;
            idUser?: number;
            localId?: string;
            feedDate: Date;
            feedType: string;
            quantity?: number;
            unit?: string;
            cost?: number;
            notes?: string;
            isSynced?: boolean;
        },
        manager?: EntityManager,
    ): Promise<FeedRecord> {
        const repo = manager?.getRepository(FeedRecord) ?? this.rawRepo;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const record = repo.create();
        record.idLot = data.idLot;
        if (data.idUser) record.idUser = data.idUser;
        if (data.localId !== undefined) record.localId = data.localId;
        record.feedDate = data.feedDate;
        record.feedType = data.feedType;
        if (data.quantity !== undefined) record.quantity = data.quantity;
        if (data.unit !== undefined) record.unit = data.unit;
        if (data.cost !== undefined) record.cost = data.cost;
        if (data.notes !== undefined) record.notes = data.notes;
        record.isSynced = data.isSynced ?? false;
        return await repo.save(record);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(FeedRecord)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new FeedRecordNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { feedType?: string; quantity?: number; unit?: string; cost?: number; notes?: string },
        manager?: EntityManager,
    ): Promise<FeedRecord> {
        const repo = manager?.getRepository(FeedRecord) ?? this.rawRepo;
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
        const repo = manager?.getRepository(FeedRecord) ?? this.rawRepo;
        const record = await repo.findOne({ where: { id } });
        if (!record) throw new FeedRecordNotFoundException(id);
        await repo.delete({ id });
    }

    async findAllByLot(idLot: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<FeedRecordDto>> {
        return await this.repo.findPaginated({
            dto: FeedRecordDto,
            pagination,
            where: { idLot },
            order: { feedDate: 'DESC' },
        });
    }
}
