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

    /**
     * RN-13: a female with an active "pregnant" diagnosis (no parturition
     * registered for it yet — the reproductive cycle hasn't closed) cannot
     * receive a new breeding service. Used by RegisterBreedingServiceUseCase.
     */
    async findActivePregnancy(idRanchAnimal: number, manager?: EntityManager): Promise<GestationDiagnosis | null> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.rawRepo;
        return (
            (await repo
                .createQueryBuilder('gd')
                .innerJoin('gd.service', 'bs')
                .innerJoin('bs.event', 'ae')
                .leftJoin('parturitions', 'p', 'p.id_diagnosis = gd.id_diagnosis')
                .where('ae.idRanchAnimal = :idRanchAnimal', { idRanchAnimal })
                .andWhere('gd.result = :result', { result: 'pregnant' })
                .andWhere('p.id_parturition IS NULL')
                .getOne()) ?? null
        );
    }

    /** Used by app/dashboard — same "pregnant without a linked parturition" rule as findActivePregnancy, ranch-scoped. */
    async countActivePregnanciesByRanch(idRanch: number, manager?: EntityManager): Promise<number> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.rawRepo;
        return await repo
            .createQueryBuilder('gd')
            .innerJoin('gd.service', 'bs')
            .innerJoin('bs.event', 'ae')
            .innerJoin('ae.animal', 'ra')
            .leftJoin('parturitions', 'p', 'p.id_diagnosis = gd.id_diagnosis')
            .where('ra.idRanch = :idRanch', { idRanch })
            .andWhere('gd.result = :result', { result: 'pregnant' })
            .andWhere('p.id_parturition IS NULL')
            .getCount();
    }

    /** Used by app/dashboard for the diagnosis-results chart (pregnant vs empty, recent window). */
    async countResultsByRanch(idRanch: number, since: Date, manager?: EntityManager): Promise<{ pregnant: number; empty: number }> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.rawRepo;
        const rows = await repo
            .createQueryBuilder('gd')
            .innerJoin('gd.event', 'ae')
            .innerJoin('ae.animal', 'ra')
            .select('gd.result', 'result')
            .addSelect('COUNT(*)', 'count')
            .where('ra.idRanch = :idRanch', { idRanch })
            .andWhere('ae.eventDate >= :since', { since })
            .groupBy('gd.result')
            .getRawMany<{ result: string; count: string }>();
        const pregnant = rows.find((r) => r.result === 'pregnant');
        const empty = rows.find((r) => r.result === 'empty');
        return { pregnant: pregnant ? Number(pregnant.count) : 0, empty: empty ? Number(empty.count) : 0 };
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
