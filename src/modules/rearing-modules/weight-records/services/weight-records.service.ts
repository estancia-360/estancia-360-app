import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WeightRecord, WeightTypeEnum } from '../entities/weight-record.entity';
import { WeightRecordDto } from '../dto/weight-record.dto';
import { WeightRecordNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class WeightRecordsService {
    private readonly repo: DtoRepository<WeightRecord>;

    constructor(
        @InjectRepository(WeightRecord)
        private readonly rawRepo: Repository<WeightRecord>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idEvent: number;
            idLot: number;
            localId?: string;
            weight: number;
            weightType: WeightTypeEnum;
            bodyCondition?: number;
            ageDays?: number;
            notes?: string;
        },
        manager?: EntityManager,
    ): Promise<WeightRecord> {
        const repo = manager?.getRepository(WeightRecord) ?? this.rawRepo;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const record = repo.create();
        record.idEvent = data.idEvent;
        record.idLot = data.idLot;
        if (data.localId !== undefined) record.localId = data.localId;
        record.weight = data.weight;
        record.weightType = data.weightType;
        if (data.bodyCondition !== undefined) record.bodyCondition = data.bodyCondition;
        if (data.ageDays !== undefined) record.ageDays = data.ageDays;
        if (data.notes !== undefined) record.notes = data.notes;
        return await this.saveOrThrowFriendly(repo, record);
    }

    // BUG-11 (mismo patron aplicado a esta tabla — migracion 012 le agrego un CHECK de rango a
    // weight; sin esto, cualquier violacion que se cuele mas alla del DTO escaparia como 500
    // crudo de Postgres en vez de un 400 entendible).
    private async saveOrThrowFriendly(repo: Repository<WeightRecord>, record: WeightRecord): Promise<WeightRecord> {
        try {
            return await repo.save(record);
        } catch (error: any) {
            if (error?.code === '23514') throw new BadRequestException({ message: 'One or more field values are out of the allowed range.', error: 'INVALID_FIELD_RANGE' });
            throw error;
        }
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(WeightRecord)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new WeightRecordNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { weight?: number; weightType?: WeightTypeEnum; bodyCondition?: number; ageDays?: number; notes?: string },
        manager?: EntityManager,
    ): Promise<WeightRecord> {
        const repo = manager?.getRepository(WeightRecord) ?? this.rawRepo;
        const record = await repo.findOne({ where: { id } });
        if (!record) throw new WeightRecordNotFoundException(id);
        if (data.weight !== undefined) record.weight = data.weight;
        if (data.weightType !== undefined) record.weightType = data.weightType;
        if (data.bodyCondition !== undefined) record.bodyCondition = data.bodyCondition;
        if (data.ageDays !== undefined) record.ageDays = data.ageDays;
        if (data.notes !== undefined) record.notes = data.notes;
        return await this.saveOrThrowFriendly(repo, record);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(WeightRecord) ?? this.rawRepo;
        await repo.delete({ id });
    }

    /** Used by DeleteWeightRecordUseCase to revert ranch_animals.weight to the previous weighing. */
    async findPreviousByAnimal(idRanchAnimal: number, beforeEventDate: Date, manager?: EntityManager): Promise<WeightRecord | null> {
        const repo = manager?.getRepository(WeightRecord) ?? this.rawRepo;
        return (
            (await repo
                .createQueryBuilder('wr')
                .innerJoin('wr.event', 'ev')
                .where('ev.idRanchAnimal = :idRanchAnimal', { idRanchAnimal })
                .andWhere('ev.eventDate < :beforeEventDate', { beforeEventDate })
                .orderBy('ev.eventDate', 'DESC')
                .getOne()) ?? null
        );
    }

    /**
     * Used by app/dashboard for the Recría/Engorde weight+weighings trend charts. Filters by
     * the animal's CURRENT productive status (same simplification as
     * RanchAnimalsService.avgWeightByProductiveStatus — weight_records doesn't snapshot the
     * animal's stage at weighing time).
     */
    async monthlyStatsByProductiveStatus(
        idRanch: number,
        idProductiveStatus: number,
        since: Date,
        manager?: EntityManager,
    ): Promise<{ month: string; count: number; avgWeight: number | null }[]> {
        const repo = manager?.getRepository(WeightRecord) ?? this.rawRepo;
        const rows = await repo
            .createQueryBuilder('wr')
            .innerJoin('wr.event', 'ae')
            .innerJoin('ae.animal', 'ra')
            .select("to_char(date_trunc('month', ae.eventDate), 'YYYY-MM')", 'month')
            .addSelect('COUNT(*)', 'count')
            .addSelect('AVG(wr.weight)', 'avgWeight')
            .where('ra.idRanch = :idRanch', { idRanch })
            .andWhere('ra.idProductiveStatus = :idProductiveStatus', { idProductiveStatus })
            .andWhere('ae.eventDate >= :since', { since })
            .groupBy("date_trunc('month', ae.eventDate)")
            .getRawMany<{ month: string; count: string; avgWeight: string | null }>();
        return rows.map((r) => ({ month: r.month, count: Number(r.count), avgWeight: r.avgWeight ? Number(r.avgWeight) : null }));
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<WeightRecordDto>> {
        return await this.repo.findPaginated({
            dto: WeightRecordDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'ASC' },
        });
    }

    async findAllByLot(idLot: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<WeightRecordDto>> {
        return await this.repo.findPaginated({
            dto: WeightRecordDto,
            pagination,
            where: { idLot },
            order: { createdAt: 'DESC' },
        });
    }
}
