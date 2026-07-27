import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HealthIncident, IncidentTypeEnum } from '../entities/health-incident.entity';
import { HealthIncidentDto } from '../dto/health-incident.dto';
import { HealthIncidentNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class HealthIncidentsService {
    private readonly repo: DtoRepository<HealthIncident>;

    constructor(
        @InjectRepository(HealthIncident)
        private readonly rawRepo: Repository<HealthIncident>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: { idEvent: number; incidentType: IncidentTypeEnum; description?: string; resolvedAt?: Date; notes?: string },
        manager?: EntityManager,
    ): Promise<HealthIncident> {
        const repo = manager?.getRepository(HealthIncident) ?? this.rawRepo;
        const incident = repo.create();
        incident.idEvent = data.idEvent;
        incident.incidentType = data.incidentType;
        if (data.description !== undefined) incident.description = data.description;
        if (data.resolvedAt !== undefined) incident.resolvedAt = data.resolvedAt;
        if (data.notes !== undefined) incident.notes = data.notes;
        return await repo.save(incident);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(HealthIncident)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new HealthIncidentNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { description?: string; resolvedAt?: Date; notes?: string },
        manager?: EntityManager,
    ): Promise<HealthIncident> {
        const repo = manager?.getRepository(HealthIncident) ?? this.rawRepo;
        const incident = await repo.findOne({ where: { id } });
        if (!incident) throw new HealthIncidentNotFoundException(id);
        if (data.description !== undefined) incident.description = data.description;
        if (data.resolvedAt !== undefined) incident.resolvedAt = data.resolvedAt;
        if (data.notes !== undefined) incident.notes = data.notes;
        return await repo.save(incident);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(HealthIncident) ?? this.rawRepo;
        await repo.delete({ id });
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<HealthIncidentDto>> {
        return await this.repo.findPaginated({
            dto: HealthIncidentDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }
}
