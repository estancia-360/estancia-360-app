import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Vaccination } from '../entities/vaccination.entity';
import { VaccinationDto } from '../dto/vaccination.dto';
import { VaccinationNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class VaccinationsService {
    private readonly repo: DtoRepository<Vaccination>;

    constructor(
        @InjectRepository(Vaccination)
        private readonly rawRepo: Repository<Vaccination>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: { idEvent: number; vaccineName: string; dose?: string; responsible?: string; notes?: string },
        manager?: EntityManager,
    ): Promise<Vaccination> {
        const repo = manager?.getRepository(Vaccination) ?? this.rawRepo;
        const vaccination = repo.create();
        vaccination.idEvent = data.idEvent;
        vaccination.vaccineName = data.vaccineName;
        if (data.dose !== undefined) vaccination.dose = data.dose;
        if (data.responsible !== undefined) vaccination.responsible = data.responsible;
        if (data.notes !== undefined) vaccination.notes = data.notes;
        return await repo.save(vaccination);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(Vaccination)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new VaccinationNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { vaccineName?: string; dose?: string; responsible?: string; notes?: string },
        manager?: EntityManager,
    ): Promise<Vaccination> {
        const repo = manager?.getRepository(Vaccination) ?? this.rawRepo;
        const vaccination = await repo.findOne({ where: { id } });
        if (!vaccination) throw new VaccinationNotFoundException(id);
        if (data.vaccineName !== undefined) vaccination.vaccineName = data.vaccineName;
        if (data.dose !== undefined) vaccination.dose = data.dose;
        if (data.responsible !== undefined) vaccination.responsible = data.responsible;
        if (data.notes !== undefined) vaccination.notes = data.notes;
        return await repo.save(vaccination);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Vaccination) ?? this.rawRepo;
        await repo.delete({ id });
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<VaccinationDto>> {
        return await this.repo.findPaginated({
            dto: VaccinationDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }
}
