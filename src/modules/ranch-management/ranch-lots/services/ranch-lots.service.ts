import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RanchLot } from '../entities/ranch-lot.entity';
import { CreateRanchLotDto } from '../dto/create-ranch-lot.dto';
import { UpdateRanchLotDto } from '../dto/update-ranch-lot.dto';
import { RanchLotDto } from '../dto/ranch-lot.dto';
import { RanchLotDetailedDto } from '../dto/ranch-lot-detailed.dto';
import { RanchLotNotFoundException, RanchLotHasAnimalsException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';
import { RanchesService } from 'src/modules/ranch-management/ranches/services/ranches.service';
import { RanchDto } from 'src/modules/ranch-management/ranches/dto/ranch.dto';
import { RanchPasturesService } from 'src/modules/ranch-management/ranch-pastures/services/ranch-pastures.service';
import { RanchPastureDto } from 'src/modules/ranch-management/ranch-pastures/dto/ranch-pasture.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

@Injectable()
export class RanchLotsService {
    private readonly repo: DtoRepository<RanchLot>;

    constructor(
        @InjectRepository(RanchLot)
        private readonly rawRepo: Repository<RanchLot>,
        private readonly ranchesService: RanchesService,
        private readonly ranchPasturesService: RanchPasturesService,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(dto: CreateRanchLotDto): Promise<RanchLotDto> {
        await this.ranchesService.findOneById(RanchDto, dto.idRanch);
        const pasture = await this.ranchPasturesService.findOneById(RanchPastureDto, dto.idRanchPasture);
        // DBI-21 (auditoria QA E2E, 2026-09-03): antes solo se validaba que el potrero existiera,
        // no que fuera de la misma estancia — se podia crear un lote de la estancia A apoyado en
        // un potrero de la estancia B.
        if (pasture.idRanch !== dto.idRanch) {
            throw new BadRequestException({
                message: `Pasture ID=${dto.idRanchPasture} does not belong to ranch ID=${dto.idRanch}.`,
                error: 'PASTURE_NOT_IN_RANCH',
            });
        }

        const lot = this.rawRepo.create();
        lot.idRanch = dto.idRanch;
        lot.idRanchPasture = dto.idRanchPasture;
        lot.name = dto.name;
        lot.lotType = dto.lotType;
        lot.capacity = dto.capacity ?? null;
        lot.isActive = true;
        // created_at/updated_at en esta tabla real NO tienen DEFAULT en la DB —
        // @CreateDateColumn/@UpdateDateColumn no los completa solo, hay que setearlos.
        lot.createdAt = new Date();
        lot.updatedAt = new Date();
        const saved = await this.saveOrThrowFriendly(lot);
        return (await this.findOneById(RanchLotDto, saved.id))!;
    }

    // BUG-11 (mismo patron aplicado a esta tabla — migracion 012 le agrego un CHECK de rango a
    // capacity; sin esto, cualquier violacion que se cuele mas alla del DTO escaparia como 500
    // crudo de Postgres en vez de un 400 entendible).
    private async saveOrThrowFriendly(lot: RanchLot): Promise<RanchLot> {
        try {
            return await this.rawRepo.save(lot);
        } catch (error: any) {
            if (error?.code === '23514') throw new BadRequestException({ message: 'One or more field values are out of the allowed range.', error: 'INVALID_FIELD_RANGE' });
            throw error;
        }
    }

    async findAllByRanch(idRanch: number): Promise<RanchLotDto[]> {
        const lots = await this.repo.find({ dto: RanchLotDto, where: { idRanch }, order: { id: 'DESC' } });

        const counts = await this.rawRepo.manager
            .getRepository(RanchAnimal)
            .createQueryBuilder('a')
            .select('a.idLot', 'idLot')
            .addSelect('COUNT(*)', 'count')
            .where('a.idRanch = :idRanch', { idRanch })
            .andWhere('a.idLot IS NOT NULL')
            .groupBy('a.idLot')
            .getRawMany<{ idLot: string; count: string }>();
        const countByLot = new Map(counts.map((c) => [Number(c.idLot), Number(c.count)]));

        for (const lot of lots) lot.animalsCount = countByLot.get(lot.id) ?? 0;
        return lots;
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new RanchLotNotFoundException(id);
        return result;
    }

    async update(id: number, dto: UpdateRanchLotDto): Promise<RanchLotDetailedDto> {
        const lot = await this.rawRepo.findOne({ where: { id } });
        if (!lot) throw new RanchLotNotFoundException(id);

        if (dto.name !== undefined) lot.name = dto.name;
        if (dto.lotType !== undefined) lot.lotType = dto.lotType;
        if (dto.capacity !== undefined) lot.capacity = dto.capacity;
        lot.updatedAt = new Date();

        const saved = await this.saveOrThrowFriendly(lot);
        return (await this.findOneById(RanchLotDetailedDto, saved.id))!;
    }

    async remove(id: number): Promise<void> {
        const lot = await this.rawRepo.findOne({ where: { id } });
        if (!lot) throw new RanchLotNotFoundException(id);

        // ranch_animals.id_lot → ranch_lots(id_lot) sin ON DELETE — sin este chequeo,
        // el DELETE explota con un error crudo de FK en vez de un 409 entendible.
        const hasAnimals = await this.rawRepo.manager.getRepository(RanchAnimal).existsBy({ idLot: id });
        if (hasAnimals) throw new RanchLotHasAnimalsException(id);

        await this.rawRepo.remove(lot);
    }
}
