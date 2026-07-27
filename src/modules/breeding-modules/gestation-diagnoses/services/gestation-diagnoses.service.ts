import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GestationDiagnosis } from '../entities/gestation-diagnosis.entity';
import { GestationDiagnosisDto } from '../dto/gestation-diagnosis.dto';
import { GestationDiagnosisNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class GestationDiagnosesService {
    private readonly repo: DtoRepository<GestationDiagnosis>;

    constructor(
        @InjectRepository(GestationDiagnosis)
        private readonly rawRepo: Repository<GestationDiagnosis>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idEvent: number;
            idService: number;
            method: string;
            result: string;
            gestationDays?: number;
            estimatedBirth?: Date;
            veterinarian?: string;
            localId?: string;
        },
        manager?: EntityManager,
    ): Promise<GestationDiagnosis> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.rawRepo;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const gd = repo.create();
        gd.idEvent = data.idEvent;
        gd.idService = data.idService;
        gd.method = data.method as any;
        gd.result = data.result as any;
        if (data.gestationDays) gd.gestationDays = data.gestationDays;
        if (data.estimatedBirth) gd.estimatedBirth = data.estimatedBirth;
        if (data.veterinarian) gd.veterinarian = data.veterinarian;
        if (data.localId) gd.localId = data.localId;
        return await repo.save(gd);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(GestationDiagnosis)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new GestationDiagnosisNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { method?: string; result?: string; gestationDays?: number; estimatedBirth?: Date; veterinarian?: string },
        manager?: EntityManager,
    ): Promise<GestationDiagnosis> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.rawRepo;
        const gd = await repo.findOne({ where: { id } });
        if (!gd) throw new GestationDiagnosisNotFoundException(id);
        if (data.method !== undefined) gd.method = data.method as any;
        if (data.result !== undefined) gd.result = data.result as any;
        if (data.gestationDays !== undefined) gd.gestationDays = data.gestationDays;
        if (data.estimatedBirth !== undefined) gd.estimatedBirth = data.estimatedBirth;
        if (data.veterinarian !== undefined) gd.veterinarian = data.veterinarian;
        return await repo.save(gd);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.rawRepo;
        await repo.delete({ id });
    }

    /** Used by app/breeding to validate 1:1 diagnosis↔breeding_service and to cascade-delete. */
    async findOneByServiceId(idService: number, manager?: EntityManager): Promise<GestationDiagnosis | null> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.rawRepo;
        return (await repo.findOne({ where: { idService } })) ?? null;
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<GestationDiagnosisDto>> {
        return await this.repo.findPaginated({
            dto: GestationDiagnosisDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }

    async findAllByRanch(idRanch: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<GestationDiagnosisDto>> {
        return await this.repo.findPaginated({
            dto: GestationDiagnosisDto,
            pagination,
            where: { event: { animal: { idRanch } } },
            order: { createdAt: 'DESC' },
        });
    }
}
