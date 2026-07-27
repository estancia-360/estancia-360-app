import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Treatment } from '../entities/treatment.entity';
import { TreatmentDto } from '../dto/treatment.dto';
import { TreatmentNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class TreatmentsService {
    private readonly repo: DtoRepository<Treatment>;

    constructor(
        @InjectRepository(Treatment)
        private readonly rawRepo: Repository<Treatment>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idEvent: number;
            illness?: string;
            medication: string;
            dose?: string;
            durationDays?: number;
            withdrawalDays?: number;
            withdrawalEndDate?: Date;
            responsible?: string;
            notes?: string;
        },
        manager?: EntityManager,
    ): Promise<Treatment> {
        const repo = manager?.getRepository(Treatment) ?? this.rawRepo;
        const treatment = repo.create();
        treatment.idEvent = data.idEvent;
        if (data.illness !== undefined) treatment.illness = data.illness;
        treatment.medication = data.medication;
        if (data.dose !== undefined) treatment.dose = data.dose;
        if (data.durationDays !== undefined) treatment.durationDays = data.durationDays;
        if (data.withdrawalDays !== undefined) treatment.withdrawalDays = data.withdrawalDays;
        if (data.withdrawalEndDate !== undefined) treatment.withdrawalEndDate = data.withdrawalEndDate;
        if (data.responsible !== undefined) treatment.responsible = data.responsible;
        if (data.notes !== undefined) treatment.notes = data.notes;
        return await repo.save(treatment);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(Treatment)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new TreatmentNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: {
            illness?: string;
            medication?: string;
            dose?: string;
            durationDays?: number;
            withdrawalDays?: number;
            withdrawalEndDate?: Date;
            responsible?: string;
            notes?: string;
        },
        manager?: EntityManager,
    ): Promise<Treatment> {
        const repo = manager?.getRepository(Treatment) ?? this.rawRepo;
        const treatment = await repo.findOne({ where: { id } });
        if (!treatment) throw new TreatmentNotFoundException(id);
        if (data.illness !== undefined) treatment.illness = data.illness;
        if (data.medication !== undefined) treatment.medication = data.medication;
        if (data.dose !== undefined) treatment.dose = data.dose;
        if (data.durationDays !== undefined) treatment.durationDays = data.durationDays;
        if (data.withdrawalDays !== undefined) treatment.withdrawalDays = data.withdrawalDays;
        if (data.withdrawalEndDate !== undefined) treatment.withdrawalEndDate = data.withdrawalEndDate;
        if (data.responsible !== undefined) treatment.responsible = data.responsible;
        if (data.notes !== undefined) treatment.notes = data.notes;
        return await repo.save(treatment);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Treatment) ?? this.rawRepo;
        await repo.delete({ id });
    }

    /** Used by RN-18 (Movimientos) to block selling an animal under active sanitary withdrawal. */
    async findActiveWithdrawal(idRanchAnimal: number, manager?: EntityManager): Promise<Treatment | null> {
        const repo = manager?.getRepository(Treatment) ?? this.rawRepo;
        return (
            (await repo
                .createQueryBuilder('t')
                .innerJoin('t.event', 'ae')
                .where('ae.idRanchAnimal = :idRanchAnimal', { idRanchAnimal })
                .andWhere('t.withdrawalEndDate >= CURRENT_DATE')
                .getOne()) ?? null
        );
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<TreatmentDto>> {
        return await this.repo.findPaginated({
            dto: TreatmentDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }
}
