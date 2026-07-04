import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Vaccination } from '../entities/vaccination.entity';
import { CreateVaccinationDto } from '../dto/create-vaccination.dto';
import { VaccinationDto } from '../dto/vaccination.dto';
import { VaccinationNotFoundException } from '../exceptions/vaccination-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class VaccinationsService {
    constructor(
        @InjectRepository(Vaccination)
        private readonly vaccinationsRepository: Repository<Vaccination>,
    ) {}

    async create(data: CreateVaccinationDto, manager?: EntityManager): Promise<Vaccination> {
        const repo = manager?.getRepository(Vaccination) ?? this.vaccinationsRepository;
        const vaccination = new Vaccination();
        vaccination.idEvent = data.idEvent;
        vaccination.vaccineName = data.vaccineName;
        vaccination.dose = data.dose;
        vaccination.responsible = data.responsible;
        vaccination.notes = data.notes;
        return await repo.save(vaccination);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, Vaccination>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(Vaccination) ?? this.vaccinationsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (VaccinationDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new VaccinationNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async update(
        id: number,
        data: { vaccineName?: string; dose?: string; responsible?: string; notes?: string },
        manager?: EntityManager,
    ): Promise<Vaccination> {
        const repo = manager?.getRepository(Vaccination) ?? this.vaccinationsRepository;
        const vaccination = await repo.findOne({ where: { id } });
        if (!vaccination) throw new VaccinationNotFoundException(id);
        if (data.vaccineName !== undefined) vaccination.vaccineName = data.vaccineName;
        if (data.dose !== undefined) vaccination.dose = data.dose;
        if (data.responsible !== undefined) vaccination.responsible = data.responsible;
        if (data.notes !== undefined) vaccination.notes = data.notes;
        return await repo.save(vaccination);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Vaccination) ?? this.vaccinationsRepository;
        await repo.delete({ id });
    }

    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (VaccinationDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.vaccinationsRepository.findAndCount({
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
