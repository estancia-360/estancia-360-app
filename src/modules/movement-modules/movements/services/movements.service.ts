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
