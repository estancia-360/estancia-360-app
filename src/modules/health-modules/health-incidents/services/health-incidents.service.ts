import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HealthIncident } from '../entities/health-incident.entity';
import { CreateHealthIncidentDto } from '../dto/create-health-incident.dto';
import { HealthIncidentDto } from '../dto/health-incident.dto';
import { HealthIncidentNotFoundException } from '../exceptions/health-incident-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class HealthIncidentsService {
    constructor(
        @InjectRepository(HealthIncident)
        private readonly healthIncidentsRepository: Repository<HealthIncident>,
    ) {}

    async create(data: CreateHealthIncidentDto, manager?: EntityManager): Promise<HealthIncident> {
        const repo = manager?.getRepository(HealthIncident) ?? this.healthIncidentsRepository;
        const incident = new HealthIncident();
        incident.idEvent = data.idEvent;
        incident.incidentType = data.incidentType;
        incident.description = data.description;
        incident.resolvedAt = data.resolvedAt;
        incident.notes = data.notes;
        return await repo.save(incident);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, HealthIncident>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(HealthIncident) ?? this.healthIncidentsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (HealthIncidentDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new HealthIncidentNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async update(
        id: number,
        data: { description?: string; resolvedAt?: Date; notes?: string },
        manager?: EntityManager,
    ): Promise<HealthIncident> {
        const repo = manager?.getRepository(HealthIncident) ?? this.healthIncidentsRepository;
        const incident = await repo.findOne({ where: { id } });
        if (!incident) throw new HealthIncidentNotFoundException(id);
        if (data.description !== undefined) incident.description = data.description;
        if (data.resolvedAt !== undefined) incident.resolvedAt = data.resolvedAt;
        if (data.notes !== undefined) incident.notes = data.notes;
        return await repo.save(incident);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(HealthIncident) ?? this.healthIncidentsRepository;
        await repo.delete({ id });
    }

    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (HealthIncidentDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.healthIncidentsRepository.findAndCount({
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
