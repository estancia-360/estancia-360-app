import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RanchPasture } from '../entities/ranch-pasture.entity';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';
import { RanchPastureDto } from '../dto/ranch-pasture.dto';
import { RanchPastureDetailedDto } from '../dto/ranch-pasture-detailed.dto';
import { RanchPastureNotFoundException, RanchPastureHasLotsException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';
import { RanchesService } from 'src/modules/ranch-management/ranches/services/ranches.service';
import { RanchDto } from 'src/modules/ranch-management/ranches/dto/ranch.dto';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';

@Injectable()
export class RanchPasturesService {
    private readonly repo: DtoRepository<RanchPasture>;

    constructor(
        @InjectRepository(RanchPasture)
        private readonly rawRepo: Repository<RanchPasture>,
        private readonly ranchesService: RanchesService,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(dto: CreateRanchPastureDto): Promise<RanchPastureDto> {
        await this.ranchesService.findOneById(RanchDto, dto.idRanch);

        const pasture = this.rawRepo.create();
        pasture.idRanch = dto.idRanch;
        pasture.name = dto.name;
        pasture.areaHectares = dto.areaHectares;
        if (dto.description) pasture.description = dto.description;
        pasture.isActive = dto.isActive ?? true;
        // created_at/updated_at en esta tabla real NO tienen DEFAULT en la DB —
        // @CreateDateColumn/@UpdateDateColumn no los completa solo, hay que setearlos.
        pasture.createdAt = new Date();
        pasture.updatedAt = new Date();
        const saved = await this.saveOrThrowFriendly(pasture);
        return (await this.findOneById(RanchPastureDto, saved.id))!;
    }

    // BUG-11 (mismo patron aplicado a esta tabla — migracion 012 le agrego un CHECK de rango a
    // area_hectares; sin esto, cualquier violacion que se cuele mas alla del DTO escaparia como
    // 500 crudo de Postgres en vez de un 400 entendible).
    private async saveOrThrowFriendly(pasture: RanchPasture): Promise<RanchPasture> {
        try {
            return await this.rawRepo.save(pasture);
        } catch (error: any) {
            if (error?.code === '23514') throw new BadRequestException({ message: 'One or more field values are out of the allowed range.', error: 'INVALID_FIELD_RANGE' });
            throw error;
        }
    }

    async findAllByRanch(idRanch: number): Promise<RanchPastureDto[]> {
        return await this.repo.find({ dto: RanchPastureDto, where: { idRanch }, order: { id: 'DESC' } });
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new RanchPastureNotFoundException(id);
        return result;
    }

    async update(id: number, dto: UpdateRanchPastureDto): Promise<RanchPastureDetailedDto> {
        const pasture = await this.rawRepo.findOne({ where: { id } });
        if (!pasture) throw new RanchPastureNotFoundException(id);

        if (dto.name !== undefined) pasture.name = dto.name;
        if (dto.areaHectares !== undefined) pasture.areaHectares = dto.areaHectares;
        if (dto.description !== undefined) pasture.description = dto.description;
        if (dto.isActive !== undefined) pasture.isActive = dto.isActive;
        pasture.updatedAt = new Date();

        const saved = await this.saveOrThrowFriendly(pasture);
        return (await this.findOneById(RanchPastureDetailedDto, saved.id))!;
    }

    async remove(id: number): Promise<void> {
        const pasture = await this.rawRepo.findOne({ where: { id } });
        if (!pasture) throw new RanchPastureNotFoundException(id);

        // ranch_lots.id_ranch_pasture → ranch_pastures(id_ranch_pasture) sin ON DELETE
        // — sin este chequeo, el DELETE explota con un error crudo de FK.
        const hasLots = await this.rawRepo.manager.getRepository(RanchLot).existsBy({ idRanchPasture: id });
        if (hasLots) throw new RanchPastureHasLotsException(id);

        await this.rawRepo.remove(pasture);
    }
}
