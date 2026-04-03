import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Parturition } from '../entities/parturition.entity';
import { CreateParturitionDto } from '../dto/create-parturition.dto';
import { ParturitionDto } from '../dto/parturition.dto';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ParturitionNotFoundException } from '../exceptions/parturition-not-found.exception';

@Injectable()
export class ParturitionsService {
    constructor(
        @InjectRepository(Parturition)
        private readonly parturitionsRepository: Repository<Parturition>,
    ) {}

    /**
     * Crea un registro en parturitions.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async create(data: CreateParturitionDto, manager?: EntityManager): Promise<Parturition> {
        const repo = manager?.getRepository(Parturition) ?? this.parturitionsRepository;
        const parturition = new Parturition();
        parturition.idEvent = data.idEvent;
        parturition.idDiagnosis = data.idDiagnosis;
        if (data.idCria) parturition.idCria = data.idCria;
        parturition.birthType = data.birthType;
        if (data.criaWeight) parturition.criaWeight = data.criaWeight;
        parturition.criaStatus = data.criaStatus;
        if (data.motherCondition) parturition.motherCondition = data.motherCondition;
        return await repo.save(parturition);
    }

    /**
     * Busca un parto por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, Parturition>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(Parturition) ?? this.parturitionsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (ParturitionDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const parturition = await repo.findOne({
            where: {
                id,
                ...(options.where ?? {}),
            },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!parturition && options.throwException) throw new ParturitionNotFoundException(id);
        if (!parturition) return null;
        return plainToInstance(templateClass, parturition, { excludeExtraneousValues: true });
    }

    /**
     * Actualiza los campos editables de un parto.
     */
    async update(
        id: number,
        data: { birthType?: string; criaWeight?: number; criaStatus?: string; motherCondition?: string },
        manager?: EntityManager,
    ): Promise<Parturition> {
        const repo = manager?.getRepository(Parturition) ?? this.parturitionsRepository;
        const parturition = await repo.findOne({ where: { id } });
        if (!parturition) throw new ParturitionNotFoundException(id);
        if (data.birthType !== undefined) parturition.birthType = data.birthType as any;
        if (data.criaWeight !== undefined) parturition.criaWeight = data.criaWeight;
        if (data.criaStatus !== undefined) parturition.criaStatus = data.criaStatus as any;
        if (data.motherCondition !== undefined) parturition.motherCondition = data.motherCondition as any;
        return await repo.save(parturition);
    }

    /**
     * Elimina un parto por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(Parturition) ?? this.parturitionsRepository;
        await repo.delete({ id });
    }

    /**
     * Verifica si ya existe un parto para un diagnóstico dado.
     * Usado en app/breeding para validar unicidad 1:1.
     */
    async findOneByDiagnosisId(idDiagnosis: number, manager?: EntityManager): Promise<Parturition | null> {
        const repo = manager?.getRepository(Parturition) ?? this.parturitionsRepository;
        return await repo.findOne({ where: { idDiagnosis } }) ?? null;
    }

    /**
     * Lista todos los partos de un animal (por código) con paginación.
     * @param animalCode - Código del animal (madre)
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de partos
     */
    async findAllByAnimalCode<T>(
        animalCode: string,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (ParturitionDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [parturitions, total] = await this.parturitionsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: {
                event: { animal: { code: animalCode } },
            },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: plainToInstance(templateClass, parturitions, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }

    /**
     * Lista todos los partos de una estancia con paginación.
     * Filtra por idRanch a través de animal_events → ranch_animals.
     * @param idRanch - ID de la estancia
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de partos con conversión de tipos (bigint→number)
     */
    async findAllByRanch<T>(
        idRanch: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (ParturitionDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;

        const [parturitions, total] = await this.parturitionsRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: {
                event: {
                    animal: {
                        idRanch,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return {
            data: plainToInstance(templateClass, parturitions, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }
}
