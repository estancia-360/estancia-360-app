import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FatteningEntry } from '../entities/fattening-entry.entity';
import { FatteningEntryDto } from '../dto/fattening-entry.dto';
import { FatteningEntryNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class FatteningEntriesService {
    private readonly repo: DtoRepository<FatteningEntry>;

    constructor(
        @InjectRepository(FatteningEntry)
        private readonly rawRepo: Repository<FatteningEntry>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(
        data: { idEvent: number; systemType: string; initialWeight?: number },
        manager?: EntityManager,
    ): Promise<FatteningEntry> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.rawRepo;
        const entry = repo.create();
        entry.idEvent = data.idEvent;
        entry.systemType = data.systemType as any;
        if (data.initialWeight !== undefined) entry.initialWeight = data.initialWeight;
        return await repo.save(entry);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }, manager?: EntityManager): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions, manager?: EntityManager): Promise<T>;
    async findOneById<T>(
        dto: new () => T,
        id: number,
        { throwException = true }: FindOptions = {},
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager ? new DtoRepository(manager.getRepository(FatteningEntry)) : this.repo;
        const result = await repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new FatteningEntryNotFoundException(id);
        return result;
    }

    async update(id: number, data: { systemType?: string; initialWeight?: number }, manager?: EntityManager): Promise<FatteningEntry> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.rawRepo;
        const entry = await repo.findOne({ where: { id } });
        if (!entry) throw new FatteningEntryNotFoundException(id);
        if (data.systemType !== undefined) entry.systemType = data.systemType as any;
        if (data.initialWeight !== undefined) entry.initialWeight = data.initialWeight;
        return await repo.save(entry);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.rawRepo;
        await repo.delete({ id });
    }

    /**
     * Busca el fattening_entry más reciente de un animal, uniendo por el
     * animal_event al que pertenece (no hay FK directo entre rearing_selections
     * y fattening_entries — son eventos separados creados en la misma tx).
     * Usado por DeleteRearingSelectionUseCase para revertir el ingreso a
     * engorde cuando se borra la selección que lo originó.
     */
    async findMostRecentByAnimal(idRanchAnimal: number, manager?: EntityManager): Promise<FatteningEntry | null> {
        const repo = manager?.getRepository(FatteningEntry) ?? this.rawRepo;
        return (
            (await repo
                .createQueryBuilder('fe')
                .innerJoin('fe.event', 'ev')
                .where('ev.idRanchAnimal = :idRanchAnimal', { idRanchAnimal })
                .orderBy('ev.eventDate', 'DESC')
                .getOne()) ?? null
        );
    }

    async findAllByAnimal(idRanchAnimal: number, pagination: PaginationParamsDto): Promise<PaginationResponseDto<FatteningEntryDto>> {
        return await this.repo.findPaginated({
            dto: FatteningEntryDto,
            pagination,
            where: { event: { idRanchAnimal } },
            order: { createdAt: 'DESC' },
        });
    }
}
