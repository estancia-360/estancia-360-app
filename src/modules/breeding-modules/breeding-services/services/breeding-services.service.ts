import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BreedingService } from '../entities/breeding-service.entity';
import { CreateBreedingServiceDto } from '../dto/create-breeding-service.dto';
import { BreedingServiceDto } from '../dto/breeding-service.dto';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BreedingServiceNotFoundException } from '../exceptions/breeding-service-not-found.exception';

@Injectable()
export class BreedingServicesService {
    constructor(
        @InjectRepository(BreedingService)
        private readonly breedingServicesRepository: Repository<BreedingService>,
    ) {}

    /**
     * Crea un registro en breeding_services.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async create(data: CreateBreedingServiceDto, manager?: EntityManager): Promise<BreedingService> {
        const repo = manager?.getRepository(BreedingService) ?? this.breedingServicesRepository;
        const bs = new BreedingService();
        bs.idEvent = data.idEvent;
        if (data.idAnimalMale) bs.idAnimalMale = data.idAnimalMale;
        bs.serviceType = data.serviceType as any;
        if (data.semenBreed) bs.semenBreed = data.semenBreed;
        if (data.technician) bs.technician = data.technician;
        if (data.reproductiveLot) bs.reproductiveLot = data.reproductiveLot;
        return await repo.save(bs);
    }

    /**
     * Busca un servicio de monta por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, BreedingService>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(BreedingService) ?? this.breedingServicesRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (BreedingServiceDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const bs = await repo.findOne({
            where: {
                id,
                ...(options.where ?? {}),
            },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!bs && options.throwException) throw new BreedingServiceNotFoundException(id);
        if (!bs) return null;
        return plainToInstance(templateClass, bs, { excludeExtraneousValues: true });
    }

    /**
     * Actualiza los campos editables de un servicio de monta.
     * No se permite cambiar el evento ni el animal vinculado.
     */
    async update(
        id: number,
        data: { serviceType?: string; semenBreed?: string; technician?: string; reproductiveLot?: string },
        manager?: EntityManager,
    ): Promise<BreedingService> {
        const repo = manager?.getRepository(BreedingService) ?? this.breedingServicesRepository;
        const bs = await repo.findOne({ where: { id } });
        if (!bs) throw new BreedingServiceNotFoundException(id);
        if (data.serviceType !== undefined) bs.serviceType = data.serviceType as any;
        if (data.semenBreed !== undefined) bs.semenBreed = data.semenBreed;
        if (data.technician !== undefined) bs.technician = data.technician;
        if (data.reproductiveLot !== undefined) bs.reproductiveLot = data.reproductiveLot;
        return await repo.save(bs);
    }

    /**
     * Elimina un servicio de monta por ID.
     * Si se pasa manager, opera dentro de la transacción activa.
     */
    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(BreedingService) ?? this.breedingServicesRepository;
        await repo.delete({ id });
    }

    /**
     * Lista todos los servicios de monta de un animal (por código) con paginación.
     * @param animalCode - Código del animal
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de servicios
     */
    async findAllByAnimalCode<T>(
        animalCode: string,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (BreedingServiceDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        console.log(template.select)
        const { page, limit } = paginationData;
        const [services, total] = await this.breedingServicesRepository.findAndCount({
            select: template.select,
            relations: template.relations,
            where: {
                event: { animal: { code: animalCode.trim() } },
            },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: plainToInstance(templateClass, services, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }

    /**
     * Lista todos los servicios de monta de una estancia con paginación.
     * Filtra por idRanch a través de animal_events → ranch_animals.
     * @param idRanch - ID de la estancia
     * @param paginationData - Datos de paginación
     * @param optionsData - Opciones de búsqueda y template DTO
     * @returns Página de servicios con conversión de tipos (bigint→number)
     */
    async findAllByRanch<T>(
        idRanch: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (BreedingServiceDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;

        const [services, total] = await this.breedingServicesRepository.findAndCount({
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
            data: plainToInstance(templateClass, services, { excludeExtraneousValues: true }),
            meta: {
                page,
                limit,
                pages: Math.ceil(total / limit),
                total,
            },
        };
    }
}
