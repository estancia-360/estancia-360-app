import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RearingSelection } from '../entities/rearing-selection.entity';
import { CreateRearingSelectionDto } from '../dto/create-rearing-selection.dto';
import { UpdateRearingSelectionDto } from '../dto/update-rearing-selection.dto';
import { RearingSelectionDto } from '../dto/rearing-selection.dto';
import { RearingSelectionNotFoundException } from '../exceptions/rearing-selection-not-found.exception';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { plainToInstance } from 'class-transformer';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class RearingSelectionsService {
    constructor(
        @InjectRepository(RearingSelection)
        private readonly rearingSelectionsRepository: Repository<RearingSelection>,
    ) {}

    async create(data: CreateRearingSelectionDto, manager?: EntityManager): Promise<RearingSelection> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rearingSelectionsRepository;
        if (data.localId) {
            const existing = await repo.findOne({ where: { localId: data.localId } });
            if (existing) return existing;
        }
        const selection = new RearingSelection();
        selection.idEvent = data.idEvent;
        selection.destination = data.destination;
        if (data.localId !== undefined) selection.localId = data.localId;
        if (data.idLotDest !== undefined) selection.idLotDest = data.idLotDest;
        if (data.weightAtSelection !== undefined) selection.weightAtSelection = data.weightAtSelection;
        if (data.bodyCondition !== undefined) selection.bodyCondition = data.bodyCondition;
        if (data.geneticScore !== undefined) selection.geneticScore = data.geneticScore;
        return await repo.save(selection);
    }

    async findOneById<T>(
        id: number,
        optionsData: OptionsFindDto<T, RearingSelection>,
        manager?: EntityManager,
    ): Promise<T | null> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rearingSelectionsRepository;
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (RearingSelectionDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const record = await repo.findOne({
            where: { id, ...(options.where ?? {}) },
            select: template.select,
            relations: template.relations,
        }) as T;
        if (!record && options.throwException) throw new RearingSelectionNotFoundException(id);
        if (!record) return null;
        return plainToInstance(templateClass, record, { excludeExtraneousValues: true });
    }

    async update(id: number, data: UpdateRearingSelectionDto, manager?: EntityManager): Promise<RearingSelection> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rearingSelectionsRepository;
        const record = await repo.findOne({ where: { id } });
        if (!record) throw new RearingSelectionNotFoundException(id);
        if (data.weightAtSelection !== undefined) record.weightAtSelection = data.weightAtSelection;
        if (data.bodyCondition !== undefined) record.bodyCondition = data.bodyCondition;
        if (data.geneticScore !== undefined) record.geneticScore = data.geneticScore;
        return await repo.save(record);
    }

    async deleteById(id: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rearingSelectionsRepository;
        await repo.delete({ id });
    }

    async findOneByEventId(idEvent: number, manager?: EntityManager): Promise<RearingSelection | null> {
        const repo = manager?.getRepository(RearingSelection) ?? this.rearingSelectionsRepository;
        return await repo.findOne({ where: { idEvent } }) ?? null;
    }

    async findAllByAnimal<T>(
        idRanchAnimal: number,
        paginationData: PaginationParamsDto,
        optionsData: OptionsFindDto<T>,
    ): Promise<PaginationResponseDto<T>> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ?? (RearingSelectionDto as unknown as new () => T);
        const template = findWithAutoMapper(templateClass);
        const { page, limit } = paginationData;
        const [records, total] = await this.rearingSelectionsRepository.findAndCount({
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
