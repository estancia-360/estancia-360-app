import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Parturition } from '../entities/parturition.entity';
import { ParturitionDto } from '../dto/parturition.dto';
import { ParturitionNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class ParturitionsService {
    private readonly repo: DtoRepository<Parturition>;

    constructor(
        @InjectRepository(Parturition)
        private readonly rawRepo: Repository<Parturition>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idEvent: number;
            idDiagnosis: number;
            idCria?: number;
            birthType: string;
            criaWeight?: number;
            criaStatus: string;
            motherCondition?: string;
            localId?: string;
        },
        manager?: EntityManager,
    ): Promise<Parturition> {
        const repo = manager?.getRepository(Parturition) ?? this.rawRepo;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const parturition = repo.create();
        parturition.idEvent = data.idEvent;
        parturition.idDiagnosis = data.idDiagnosis;
        if (data.idCria) parturition.idCria = data.idCria;
        parturition.birthType = data.birthType as any;
        if (data.criaWeight) parturition.criaWeight = data.criaWeight;
        parturition.criaStatus = data.criaStatus as any;
        if (data.motherCondition) parturition.motherCondition = data.motherCondition as any;
        if (data.localId) parturition.localId = data.localId;
        return await repo.save(parturition);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(Parturition)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new ParturitionNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { birthType?: string; criaWeight?: number; criaStatus?: string; motherCondition?: string },
        manager?: EntityManager,
    ): Promise<Parturition> {
        const repo = manager?.getRepository(Parturition) ?? this.rawRepo;
        const parturition = await repo.findOne({ where: { id } });
        if (!parturition) throw new ParturitionNotFoundException(id);
        if (data.birthType !== undefined) parturition.birthType = data.birthType as any;
        if (data.criaWeight !== undefined) parturition.criaWeight = data.criaWeight;
        if (data.criaStatus !== undefined) parturition.criaStatus = data.criaStatus as any;
        if (data.motherCondition !== undefined) parturition.motherCondition = data.motherCondition as any;
        return await repo.save(parturition);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Parturition) ?? this.rawRepo;
        await repo.delete({ id });
    }

    /** Used by app/breeding to validate 1:1 diagnosis↔parturition and to cascade-delete. */
    async findOneByDiagnosisId(idDiagnosis: number, manager?: EntityManager): Promise<Parturition | null> {
        const repo = manager?.getRepository(Parturition) ?? this.rawRepo;
        return (await repo.findOne({ where: { idDiagnosis } })) ?? null;
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<ParturitionDto>> {
        return await this.repo.findPaginated({
            dto: ParturitionDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }

    async findAllByRanch(idRanch: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<ParturitionDto>> {
        return await this.repo.findPaginated({
            dto: ParturitionDto,
            pagination,
            where: { event: { animal: { idRanch } } },
            order: { createdAt: 'DESC' },
        });
    }
}
