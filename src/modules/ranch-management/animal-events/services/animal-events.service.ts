import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AnimalEvent } from '../entities/animal-event.entity';
import { CreateAnimalEventDto } from '../dto/create-animal-event.dto';
import { AnimalEventDto } from '../dto/animal-event.dto';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { MyNotFoundException } from 'src/shared/exceptions';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class AnimalEventsService {
    constructor(
        @InjectRepository(AnimalEvent)
        private readonly animalEventsRepository: Repository<AnimalEvent>
    ) {}

    /**
     * Crea un nuevo animal_event.
     * Si se pasa un manager (transacción activa), el insert se ejecuta dentro de ella.
     */
    async create(data: CreateAnimalEventDto, manager?: EntityManager): Promise<AnimalEvent> {
        const repo = manager?.getRepository(AnimalEvent) ?? this.animalEventsRepository;
        const event = new AnimalEvent();
        event.idRanchAnimal = data.idRanchAnimal;
        event.idEventType = data.idEventType;
        if (data.notes) event.notes = data.notes;
        event.isSynced = data.isSynced ?? false;
        event.eventDate = data.eventDate;
        return await repo.save(event);
    }

    /**
     * Busca un evento por ID.
     * Si se pasa manager, la consulta opera dentro de la transacción activa.
     */
    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, AnimalEvent>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(AnimalEvent) ?? this.animalEventsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (AnimalEventDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const event = await repo.findOne({
            where: {
                id,
                ...(options.where ?? {}),
            },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!event && options.throwException) {
            throw new MyNotFoundException(`El evento con ID = ${id} no fue encontrado.`);
        }
        if (!event) return null;
        return plainToInstance(templateClass, event, { excludeExtraneousValues: true });
    }

    /**
     * Elimina un evento animal por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(AnimalEvent) ?? this.animalEventsRepository;
        await repo.delete({ id });
    }

    /**
     * Obtiene todos los eventos de un animal con paginación estándar.
     */
    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (AnimalEventDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [events, total] = await this.animalEventsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: { idRanchAnimal },
            skip: (page - 1) * limit,
            take: limit,
            order: { eventDate: 'DESC' },
        }) as [T[], number];
        return {
            data: plainToInstance(templateClass, events),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }
}
