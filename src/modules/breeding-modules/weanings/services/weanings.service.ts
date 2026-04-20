import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Weaning } from '../entities/weaning.entity';
import { CreateWeaningDto } from '../dto/create-weaning.dto';
import { WeaningDto } from '../dto/weaning.dto';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { WeaningNotFoundException } from '../exceptions/weaning-not-found.exception';

@Injectable()
export class WeaningsService {
    constructor(
        @InjectRepository(Weaning)
        private readonly weaningsRepository: Repository<Weaning>,
    ) {}

    /**
     * Crea un registro en weanings.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async create(data: CreateWeaningDto, manager?: EntityManager): Promise<Weaning> {
        const repo = manager?.getRepository(Weaning) ?? this.weaningsRepository;
        const weaning = new Weaning();
        weaning.idEvent = data.idEvent;
        weaning.idCria = data.idCria;
        weaning.idLotDest = data.idLotDest;
        if (data.weaningWeight) weaning.weaningWeight = data.weaningWeight;
        if (data.weaningAge) weaning.weaningAge = data.weaningAge;
        return await repo.save(weaning);
    }

    /**
     * Busca un destete por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, Weaning>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(Weaning) ?? this.weaningsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (WeaningDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const weaning = await repo.findOne({
            where: {
                id,
                ...(options.where ?? {}),
            },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!weaning && options.throwException) throw new WeaningNotFoundException(id);
        if (!weaning) return null;
        return plainToInstance(templateClass, weaning, { excludeExtraneousValues: true });
    }

    /**
     * Actualiza los campos editables de un destete.
     */
    async update(
        id: number,
        data: { weaningWeight?: number; weaningAge?: number },
        manager?: EntityManager,
    ): Promise<Weaning> {
        const repo = manager?.getRepository(Weaning) ?? this.weaningsRepository;
        const weaning = await repo.findOne({ where: { id } });
        if (!weaning) throw new WeaningNotFoundException(id);
        if (data.weaningWeight !== undefined) weaning.weaningWeight = data.weaningWeight;
        if (data.weaningAge !== undefined) weaning.weaningAge = data.weaningAge;
        return await repo.save(weaning);
    }

    /**
     * Elimina un destete por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Weaning) ?? this.weaningsRepository;
        await repo.delete({ id });
    }

    /**
     * Verifica si ya existe un destete para una cría y evento dados.
     */
    async findOneByEventId(idEvent: number, manager?: EntityManager): Promise<Weaning | null> {
        const repo = manager?.getRepository(Weaning) ?? this.weaningsRepository;
        return await repo.findOne({ where: { idEvent } }) ?? null;
    }

    /**
     * Busca destete por ID de cría.
     */
    async findOneByCriaId(idCria: number, manager?: EntityManager): Promise<Weaning | null> {
        const repo = manager?.getRepository(Weaning) ?? this.weaningsRepository;
        return await repo.findOne({ where: { idCria } }) ?? null;
    }

    /**
     * Lista todos los destetes de un animal (por código) con paginación.
     * @param animalCode - Código del animal (cría)
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de destetes
     */
    async findAllByAnimalId<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (WeaningDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [weanings, total] = await this.weaningsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: { idCria: idRanchAnimal },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: plainToInstance(templateClass, weanings, { excludeExtraneousValues: true }),
            meta: { page, limit, pages: Math.ceil(total / limit), total },
        };
    }

    async findAllByAnimalCode<T>(
        animalCode: string,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (WeaningDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [weanings, total] = await this.weaningsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: {
                cria: { code: animalCode },
            },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: plainToInstance(templateClass, weanings, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }

    /**
     * Lista todos los destetes de una estancia con paginación.
     * Filtra por idRanch a través de ranch_animals.
     * @param idRanch - ID de la estancia
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de destetes con conversión de tipos (bigint→number)
     */
    async findAllByRanch<T>(
        idRanch: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (WeaningDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;

        const [weanings, total] = await this.weaningsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: {
                cria: {
                    idRanch,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return {
            data: plainToInstance(templateClass, weanings, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }
}
