import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GestationDiagnosis } from '../entities/gestation-diagnosis.entity';
import { CreateGestationDiagnosisDto } from '../dto/create-gestation-diagnosis.dto';
import { GestationDiagnosisDto } from '../dto/gestation-diagnosis.dto';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { GestationDiagnosisNotFoundException } from '../exceptions/gestation-diagnosis-not-found.exception';

@Injectable()
export class GestationDiagnosesService {
    constructor(
        @InjectRepository(GestationDiagnosis)
        private readonly gestationDiagnosisRepository: Repository<GestationDiagnosis>,
    ) {}

    /**
     * Crea un registro en gestation_diagnoses.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async create(data: CreateGestationDiagnosisDto, manager?: EntityManager): Promise<GestationDiagnosis> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.gestationDiagnosisRepository;
        const gd = new GestationDiagnosis();
        gd.idEvent = data.idEvent;
        gd.idService = data.idService;
        gd.method = data.method;
        gd.result = data.result;
        if (data.gestationDays) gd.gestationDays = data.gestationDays;
        if (data.estimatedBirth) gd.estimatedBirth = data.estimatedBirth;
        if (data.veterinarian) gd.veterinarian = data.veterinarian;
        return await repo.save(gd);
    }

    /**
     * Busca un diagnóstico de gestación por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, GestationDiagnosis>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.gestationDiagnosisRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (GestationDiagnosisDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const gd = await repo.findOne({
            where: {
                id,
                ...(options.where ?? {}),
            },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!gd && options.throwException) throw new GestationDiagnosisNotFoundException(id);
        if (!gd) return null;
        return plainToInstance(templateClass, gd, { excludeExtraneousValues: true });
    }

    /**
     * Actualiza los campos editables de un diagnóstico de gestación.
     */
    async update(
        id: number,
        data: { method?: string; result?: string; gestationDays?: number; estimatedBirth?: Date; veterinarian?: string },
        manager?: EntityManager,
    ): Promise<GestationDiagnosis> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.gestationDiagnosisRepository;
        const gd = await repo.findOne({ where: { id } });
        if (!gd) throw new GestationDiagnosisNotFoundException(id);
        if (data.method !== undefined) gd.method = data.method as any;
        if (data.result !== undefined) gd.result = data.result as any;
        if (data.gestationDays !== undefined) gd.gestationDays = data.gestationDays;
        if (data.estimatedBirth !== undefined) gd.estimatedBirth = data.estimatedBirth;
        if (data.veterinarian !== undefined) gd.veterinarian = data.veterinarian;
        return await repo.save(gd);
    }

    /**
     * Elimina un diagnóstico de gestación por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.gestationDiagnosisRepository;
        await repo.delete({ id });
    }

    /**
     * Verifica si ya existe un diagnóstico para un servicio de monta dado.
     * Usado en app/breeding para validar unicidad 1:1.
     */
    async findOneByServiceId(idService: number, manager?: EntityManager): Promise<GestationDiagnosis | null> {
        const repo = manager?.getRepository(GestationDiagnosis) ?? this.gestationDiagnosisRepository;
        return await repo.findOne({ where: { idService } }) ?? null;
    }

    /**
     * Lista todos los diagnósticos de gestación de un animal (por código) con paginación.
     * @param animalCode - Código del animal
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de diagnósticos
     */
    async findAllByAnimalCode<T>(
        animalCode: string,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (GestationDiagnosisDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [diagnoses, total] = await this.gestationDiagnosisRepository.findAndCount({
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
            data: plainToInstance(templateClass, diagnoses, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }

    /**
     * Lista todos los diagnósticos de gestación de una estancia con paginación.
     * Filtra por idRanch a través de animal_events → ranch_animals.
     * @param idRanch - ID de la estancia
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de diagnósticos con conversión de tipos (bigint→number)
     */
    async findAllByRanch<T>(
        idRanch: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (GestationDiagnosisDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;

        const [diagnoses, total] = await this.gestationDiagnosisRepository.findAndCount({
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
            data: plainToInstance(templateClass, diagnoses, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }
}
