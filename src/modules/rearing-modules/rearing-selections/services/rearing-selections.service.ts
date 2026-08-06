import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RearingSelection, RearingDestinationEnum } from '../entities/rearing-selection.entity';
import { RearingSelectionDto } from '../dto/rearing-selection.dto';
import { RearingSelectionNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class RearingSelectionsService {
    private readonly repo: DtoRepository<RearingSelection>;

    constructor(
        @InjectRepository(RearingSelection)
        private readonly rawRepo: Repository<RearingSelection>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idEvent: number;
            localId?: string;
            idLotDest?: number;
            destination: RearingDestinationEnum;
            weightAtSelection?: number;
            bodyCondition?: number;
            geneticScore?: number;
            ageDays?: number;
        },
        manager?: EntityManager,
    ): Promise<RearingSelection> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rawRepo;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const selection = repo.create();
        selection.idEvent = data.idEvent;
        selection.destination = data.destination;
        if (data.localId !== undefined) selection.localId = data.localId;
        if (data.idLotDest !== undefined) selection.idLotDest = data.idLotDest;
        if (data.weightAtSelection !== undefined) selection.weightAtSelection = data.weightAtSelection;
        if (data.bodyCondition !== undefined) selection.bodyCondition = data.bodyCondition;
        if (data.geneticScore !== undefined) selection.geneticScore = data.geneticScore;
        if (data.ageDays !== undefined) selection.ageDays = data.ageDays;
        return await repo.save(selection);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(RearingSelection)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new RearingSelectionNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { weightAtSelection?: number; bodyCondition?: number; geneticScore?: number; ageDays?: number },
        manager?: EntityManager,
    ): Promise<RearingSelection> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rawRepo;
        const record = await repo.findOne({ where: { id } });
        if (!record) throw new RearingSelectionNotFoundException(id);
        if (data.weightAtSelection !== undefined) record.weightAtSelection = data.weightAtSelection;
        if (data.bodyCondition !== undefined) record.bodyCondition = data.bodyCondition;
        if (data.geneticScore !== undefined) record.geneticScore = data.geneticScore;
        if (data.ageDays !== undefined) record.ageDays = data.ageDays;
        return await repo.save(record);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rawRepo;
        await repo.delete({ id });
    }

    /** Used by app/dashboard for the selection-destination chart. Historical, not windowed — "where they ended up". */
    async countByDestinationByRanch(
        idRanch: number,
        manager?: EntityManager,
    ): Promise<{ replacement: number; fattening: number; sale: number }> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rawRepo;
        const rows = await repo
            .createQueryBuilder('rs')
            .innerJoin('rs.event', 'ae')
            .innerJoin('ae.animal', 'ra')
            .select('rs.destination', 'destination')
            .addSelect('COUNT(*)', 'count')
            .where('ra.idRanch = :idRanch', { idRanch })
            .groupBy('rs.destination')
            .getRawMany<{ destination: RearingDestinationEnum; count: string }>();
        const find = (d: RearingDestinationEnum) => rows.find((r) => r.destination === d);
        return {
            replacement: Number(find(RearingDestinationEnum.REPLACEMENT)?.count ?? 0),
            fattening: Number(find(RearingDestinationEnum.FATTENING)?.count ?? 0),
            sale: Number(find(RearingDestinationEnum.SALE)?.count ?? 0),
        };
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<RearingSelectionDto>> {
        return await this.repo.findPaginated({
            dto: RearingSelectionDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }
}
