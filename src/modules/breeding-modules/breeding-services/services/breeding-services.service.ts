import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BreedingService } from '../entities/breeding-service.entity';
import { BreedingServiceDto } from '../dto/breeding-service.dto';
import { BreedingServiceNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class BreedingServicesService {
    private readonly repo: DtoRepository<BreedingService>;

    constructor(
        @InjectRepository(BreedingService)
        private readonly rawRepo: Repository<BreedingService>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: {
            idEvent: number;
            idAnimalMale?: number;
            serviceType: string;
            semenBreed?: string;
            technician?: string;
            reproductiveLot?: string;
        },
        manager?: EntityManager,
    ): Promise<BreedingService> {
        const repo = manager?.getRepository(BreedingService) ?? this.rawRepo;
        const bs = repo.create();
        bs.idEvent = data.idEvent;
        if (data.idAnimalMale) bs.idAnimalMale = data.idAnimalMale;
        bs.serviceType = data.serviceType as any;
        if (data.semenBreed) bs.semenBreed = data.semenBreed;
        if (data.technician) bs.technician = data.technician;
        if (data.reproductiveLot) bs.reproductiveLot = data.reproductiveLot;
        return await repo.save(bs);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(BreedingService)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new BreedingServiceNotFoundException(id);
        return result;
    }

    async update(
        id: number,
        data: { serviceType?: string; semenBreed?: string; technician?: string; reproductiveLot?: string },
        manager?: EntityManager,
    ): Promise<BreedingService> {
        const repo = manager?.getRepository(BreedingService) ?? this.rawRepo;
        const bs = await repo.findOne({ where: { id } });
        if (!bs) throw new BreedingServiceNotFoundException(id);
        if (data.serviceType !== undefined) bs.serviceType = data.serviceType as any;
        if (data.semenBreed !== undefined) bs.semenBreed = data.semenBreed;
        if (data.technician !== undefined) bs.technician = data.technician;
        if (data.reproductiveLot !== undefined) bs.reproductiveLot = data.reproductiveLot;
        return await repo.save(bs);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(BreedingService) ?? this.rawRepo;
        await repo.delete({ id });
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<BreedingServiceDto>> {
        return await this.repo.findPaginated({
            dto: BreedingServiceDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }

    async findAllByRanch(idRanch: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<BreedingServiceDto>> {
        return await this.repo.findPaginated({
            dto: BreedingServiceDto,
            pagination,
            where: { event: { animal: { idRanch } } },
            order: { createdAt: 'DESC' },
        });
    }
}
