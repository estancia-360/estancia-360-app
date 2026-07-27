import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AnimalExit, ExitReasonEnum } from '../entities/animal-exit.entity';
import { AnimalExitDto } from '../dto/animal-exit.dto';
import { AnimalExitNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class AnimalExitsService {
    private readonly repo: DtoRepository<AnimalExit>;

    constructor(
        @InjectRepository(AnimalExit)
        private readonly rawRepo: Repository<AnimalExit>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: { idEvent: number; reason: ExitReasonEnum; notes?: string; localId?: string },
        manager?: EntityManager,
    ): Promise<AnimalExit> {
        const repo = manager?.getRepository(AnimalExit) ?? this.rawRepo;
        const exit = repo.create();
        exit.idEvent = data.idEvent;
        exit.reason = data.reason;
        if (data.notes !== undefined) exit.notes = data.notes;
        if (data.localId !== undefined) exit.localId = data.localId;
        return await repo.save(exit);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(AnimalExit)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new AnimalExitNotFoundException(id);
        return result;
    }

    async findOneByLocalId(localId: string, manager?: EntityManager): Promise<AnimalExit | null> {
        const repo = manager?.getRepository(AnimalExit) ?? this.rawRepo;
        return (await repo.findOne({ where: { localId } })) ?? null;
    }

    async update(id: number, data: { reason?: ExitReasonEnum; notes?: string }, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(AnimalExit) ?? this.rawRepo;
        const exit = await repo.findOne({ where: { id } });
        if (!exit) throw new AnimalExitNotFoundException(id);
        if (data.reason !== undefined) exit.reason = data.reason;
        if (data.notes !== undefined) exit.notes = data.notes;
        await repo.save(exit);
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<AnimalExitDto>> {
        return await this.repo.findPaginated({
            dto: AnimalExitDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }
}
