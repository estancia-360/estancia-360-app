import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Treatment } from '../entities/treatment.entity';
import { CreateTreatmentDto } from '../dto/create-treatment.dto';
import { TreatmentDto } from '../dto/treatment.dto';
import { TreatmentNotFoundException } from '../exceptions/treatment-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class TreatmentsService {
    constructor(
        @InjectRepository(Treatment)
        private readonly treatmentsRepository: Repository<Treatment>,
    ) {}

    async create(data: CreateTreatmentDto, manager?: EntityManager): Promise<Treatment> {
        const repo = manager?.getRepository(Treatment) ?? this.treatmentsRepository;
        const treatment = new Treatment();
        treatment.idEvent = data.idEvent;
        treatment.illness = data.illness;
        treatment.medication = data.medication;
        treatment.dose = data.dose;
        treatment.durationDays = data.durationDays;
        treatment.withdrawalDays = data.withdrawalDays;
        treatment.withdrawalEndDate = data.withdrawalEndDate;
        treatment.responsible = data.responsible;
        treatment.notes = data.notes;
        return await repo.save(treatment);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, Treatment>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(Treatment) ?? this.treatmentsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (TreatmentDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new TreatmentNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
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
        const repo = manager?.getRepository(Treatment) ?? this.treatmentsRepository;
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
        const repo = manager?.getRepository(Treatment) ?? this.treatmentsRepository;
        await repo.delete({ id });
    }

    async findActiveWithdrawal(idRanchAnimal: number, manager?: EntityManager): Promise<Treatment | null> {
        const repo = manager?.getRepository(Treatment) ?? this.treatmentsRepository;
        return await repo
            .createQueryBuilder('t')
            .innerJoin('t.event', 'ae')
            .where('ae.idRanchAnimal = :idRanchAnimal', { idRanchAnimal })
            .andWhere('t.withdrawalEndDate >= CURRENT_DATE')
            .getOne() ?? null;
    }

    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (TreatmentDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.treatmentsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: { event: { idRanchAnimal } },
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
