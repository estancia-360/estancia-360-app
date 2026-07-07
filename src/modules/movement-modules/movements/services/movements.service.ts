import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Movement, MovementStatusEnum, MovementTypeEnum } from '../entities/movement.entity';
import { MovementDto } from '../dto/movement.dto';
import { MovementNotFoundException } from '../exceptions/movement-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class MovementsService {
    constructor(
        @InjectRepository(Movement)
        private readonly movementsRepository: Repository<Movement>,
    ) {}

    async create(data: {
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
    }, manager?: EntityManager): Promise<Movement> {
        const repo = manager?.getRepository(Movement) ?? this.movementsRepository;
        const movement = new Movement();
        movement.idRanch = data.idRanch;
        movement.idUser = data.idUser;
        movement.movementType = data.movementType;
        movement.movementDate = data.movementDate;
        movement.status = data.status;
        movement.counterpartName = data.counterpartName;
        movement.originName = data.originName;
        movement.totalPrice = data.totalPrice;
        movement.pricePerKg = data.pricePerKg;
        movement.notes = data.notes;
        movement.localId = data.localId;
        movement.isSynced = data.isSynced ?? false;
        return await repo.save(movement);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, Movement>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(Movement) ?? this.movementsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (MovementDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new MovementNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async findEntityById(id: number, manager?: EntityManager): Promise<Movement | null> {
        const repo = manager?.getRepository(Movement) ?? this.movementsRepository;
        return await repo.findOne({ where: { id } }) ?? null;
    }

    async findOneByLocalId(localId: string, manager?: EntityManager): Promise<Movement | null> {
        const repo = manager?.getRepository(Movement) ?? this.movementsRepository;
        return await repo.findOne({ where: { localId } }) ?? null;
    }

    async updateStatus(id: number, status: MovementStatusEnum, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Movement) ?? this.movementsRepository;
        await repo.update({ id }, { status, updatedAt: new Date() });
    }

    async findAllByRanch<T>(
        idRanch: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
        filters?: { movementType?: MovementTypeEnum; status?: MovementStatusEnum },
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (MovementDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.movementsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: {
                idRanch,
                ...(filters?.movementType ? { movementType: filters.movementType } : {}),
                ...(filters?.status ? { status: filters.status } : {}),
            },
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
