import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Movement, MovementStatusEnum, MovementTypeEnum } from '../entities/movement.entity';
import { MovementDto } from '../dto/movement.dto';
import { MovementNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class MovementsService {
    private readonly repo: DtoRepository<Movement>;

    constructor(
        @InjectRepository(Movement)
        private readonly rawRepo: Repository<Movement>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idRanch: number;
            idUser?: number;
            movementType: MovementTypeEnum;
            movementDate: Date;
            status: MovementStatusEnum;
            counterpartName?: string;
            originName?: string;
            totalPrice?: number;
            pricePerKg?: number;
            notes?: string;
            localId?: string;
            isSynced?: boolean;
        },
        manager?: EntityManager,
    ): Promise<Movement> {
        const repo = manager?.getRepository(Movement) ?? this.rawRepo;
        const movement = repo.create();
        movement.idRanch = data.idRanch;
        if (data.idUser) movement.idUser = data.idUser;
        movement.movementType = data.movementType;
        movement.movementDate = data.movementDate;
        movement.status = data.status;
        if (data.counterpartName !== undefined) movement.counterpartName = data.counterpartName;
        if (data.originName !== undefined) movement.originName = data.originName;
        if (data.totalPrice !== undefined) movement.totalPrice = data.totalPrice;
        if (data.pricePerKg !== undefined) movement.pricePerKg = data.pricePerKg;
        if (data.notes !== undefined) movement.notes = data.notes;
        if (data.localId !== undefined) movement.localId = data.localId;
        movement.isSynced = data.isSynced ?? false;
        return await repo.save(movement);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(Movement)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new MovementNotFoundException(id);
        return result;
    }

    async findEntityById(id: number, manager?: EntityManager): Promise<Movement | null> {
        const repo = manager?.getRepository(Movement) ?? this.rawRepo;
        return (await repo.findOne({ where: { id } })) ?? null;
    }

    async findOneByLocalId(localId: string, manager?: EntityManager): Promise<Movement | null> {
        const repo = manager?.getRepository(Movement) ?? this.rawRepo;
        return (await repo.findOne({ where: { localId } })) ?? null;
    }

    async updateStatus(id: number, status: MovementStatusEnum, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Movement) ?? this.rawRepo;
        await repo.update({ id }, { status, updatedAt: new Date() });
    }

    /** Used by app/dashboard to alert about sales awaiting confirmation. */
    async countPendingSales(idRanch: number, manager?: EntityManager): Promise<number> {
        const repo = manager?.getRepository(Movement) ?? this.rawRepo;
        return await repo.count({
            where: { idRanch, movementType: MovementTypeEnum.SALE, status: MovementStatusEnum.PENDING },
        });
    }

    /** Used by app/dashboard for the "Movimientos del mes" section. */
    async getMonthlyStats(
        idRanch: number,
        monthStart: Date,
        monthEnd: Date,
        manager?: EntityManager,
    ): Promise<{ salesCount: number; salesAmount: number; purchasesCount: number; purchasesAmount: number }> {
        const repo = manager?.getRepository(Movement) ?? this.rawRepo;
        const rows = await repo
            .createQueryBuilder('m')
            .select('m.movementType', 'movementType')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(m.totalPrice), 0)', 'amount')
            .where('m.idRanch = :idRanch', { idRanch })
            .andWhere('m.movementDate BETWEEN :monthStart AND :monthEnd', { monthStart, monthEnd })
            .andWhere('m.movementType IN (:...types)', { types: [MovementTypeEnum.SALE, MovementTypeEnum.PURCHASE] })
            .groupBy('m.movementType')
            .getRawMany<{ movementType: string; count: string; amount: string }>();

        const sales = rows.find((r) => r.movementType === MovementTypeEnum.SALE);
        const purchases = rows.find((r) => r.movementType === MovementTypeEnum.PURCHASE);
        return {
            salesCount: sales ? Number(sales.count) : 0,
            salesAmount: sales ? Number(sales.amount) : 0,
            purchasesCount: purchases ? Number(purchases.count) : 0,
            purchasesAmount: purchases ? Number(purchases.amount) : 0,
        };
    }

    /** Used by app/dashboard for the movements trend chart. Postgres omits empty months — caller backfills zeros. */
    async getMonthlyTrend(
        idRanch: number,
        since: Date,
        manager?: EntityManager,
    ): Promise<{ month: string; movementType: MovementTypeEnum; count: number; amount: number }[]> {
        const repo = manager?.getRepository(Movement) ?? this.rawRepo;
        const rows = await repo
            .createQueryBuilder('m')
            .select("to_char(date_trunc('month', m.movementDate), 'YYYY-MM')", 'month')
            .addSelect('m.movementType', 'movementType')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(m.totalPrice), 0)', 'amount')
            .where('m.idRanch = :idRanch', { idRanch })
            .andWhere('m.movementDate >= :since', { since })
            .andWhere('m.movementType IN (:...types)', { types: [MovementTypeEnum.SALE, MovementTypeEnum.PURCHASE] })
            .groupBy("date_trunc('month', m.movementDate)")
            .addGroupBy('m.movementType')
            .getRawMany<{ month: string; movementType: MovementTypeEnum; count: string; amount: string }>();
        return rows.map((r) => ({ month: r.month, movementType: r.movementType, count: Number(r.count), amount: Number(r.amount) }));
    }

    async findAllByRanch(
        idRanch: number,
        pagination: PaginationParamsDto,
        filters?: { movementType?: MovementTypeEnum; status?: MovementStatusEnum },
    ): Promise<PaginationResponseDto<MovementDto>> {
        return await this.repo.findPaginated({
            dto: MovementDto,
            pagination,
            where: {
                idRanch,
                ...(filters?.movementType ? { movementType: filters.movementType } : {}),
                ...(filters?.status ? { status: filters.status } : {}),
            },
            order: { createdAt: 'DESC' },
        });
    }
}
