import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Weaning } from '../entities/weaning.entity';
import { WeaningDto } from '../dto/weaning.dto';
import { WeaningNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class WeaningsService {
    private readonly repo: DtoRepository<Weaning>;

    constructor(
        @InjectRepository(Weaning)
        private readonly rawRepo: Repository<Weaning>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: { idEvent: number; idCria: number; idLotDest: number; weaningWeight?: number; weaningAge?: number },
        manager?: EntityManager,
    ): Promise<Weaning> {
        const repo = manager?.getRepository(Weaning) ?? this.rawRepo;
        const weaning = repo.create();
        weaning.idEvent = data.idEvent;
        weaning.idCria = data.idCria;
        weaning.idLotDest = data.idLotDest;
        if (data.weaningWeight) weaning.weaningWeight = data.weaningWeight;
        if (data.weaningAge) weaning.weaningAge = data.weaningAge;
        return await repo.save(weaning);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(Weaning)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new WeaningNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { weaningWeight?: number; weaningAge?: number },
        manager?: EntityManager,
    ): Promise<Weaning> {
        const repo = manager?.getRepository(Weaning) ?? this.rawRepo;
        const weaning = await repo.findOne({ where: { id } });
        if (!weaning) throw new WeaningNotFoundException(id);
        if (data.weaningWeight !== undefined) weaning.weaningWeight = data.weaningWeight;
        if (data.weaningAge !== undefined) weaning.weaningAge = data.weaningAge;
        return await repo.save(weaning);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Weaning) ?? this.rawRepo;
        await repo.delete({ id });
    }

    async findAllByAnimal(idCria: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<WeaningDto>> {
        return await this.repo.findPaginated({
            dto: WeaningDto,
            pagination,
            where: { idCria },
            order: { createdAt: 'DESC' },
        });
    }

    async findAllByRanch(idRanch: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<WeaningDto>> {
        return await this.repo.findPaginated({
            dto: WeaningDto,
            pagination,
            where: { cria: { idRanch } },
            order: { createdAt: 'DESC' },
        });
    }
}
