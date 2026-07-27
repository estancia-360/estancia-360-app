import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AnimalEvent } from '../entities/animal-event.entity';
import { AnimalEventDto } from '../dto/animal-event.dto';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class AnimalEventsService {
    private readonly repo: DtoRepository<AnimalEvent>;

    constructor(
        @InjectRepository(AnimalEvent)
        private readonly rawRepo: Repository<AnimalEvent>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    /**
     * Used by every register use-case, always the first step of its transaction.
     * idUser comes from the authenticated user (@CurrentUser) — old never populated
     * this real DB column even though it exists; now that auth is real, we set it.
     */
    async create(
        data: { idRanchAnimal: number; idEventType: number; idUser?: number; notes?: string; isSynced: boolean; eventDate: Date },
        manager?: EntityManager,
    ): Promise<AnimalEvent> {
        const repo = manager?.getRepository(AnimalEvent) ?? this.rawRepo;
        const event = repo.create();
        event.idRanchAnimal = data.idRanchAnimal;
        event.idEventType = data.idEventType;
        if (data.idUser) event.idUser = data.idUser;
        if (data.notes) event.notes = data.notes;
        event.isSynced = data.isSynced;
        event.eventDate = data.eventDate;
        return await repo.save(event);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(AnimalEvent)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) {
            throw new NotFoundException({ message: `Animal event ID=${id} not found.`, error: 'ANIMAL_EVENT_NOT_FOUND' });
        }
        return result;
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(AnimalEvent) ?? this.rawRepo;
        await repo.delete({ id });
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<AnimalEventDto>> {
        return await this.repo.findPaginated({
            dto: AnimalEventDto,
            pagination,
            where: { idRanchAnimal },
            order: { eventDate: 'DESC' },
        });
    }
}
