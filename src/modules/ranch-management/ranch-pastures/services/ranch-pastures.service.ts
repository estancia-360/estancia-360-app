import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RanchPasture } from '../entities/ranch-pasture.entity';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';
import { RanchPastureDto } from '../dto/ranch-pasture.dto';
import { RanchPastureDetailedDto } from '../dto/ranch-pasture-detailed.dto';
import { RanchPastureNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';
import { RanchesService } from 'src/modules/ranch-management/ranches/services/ranches.service';
import { RanchDto } from 'src/modules/ranch-management/ranches/dto/ranch.dto';

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
        const saved = await this.rawRepo.save(pasture);
        return (await this.findOneById(RanchPastureDto, saved.id))!;
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

        const saved = await this.rawRepo.save(pasture);
        return (await this.findOneById(RanchPastureDetailedDto, saved.id))!;
    }

    async remove(id: number): Promise<void> {
        const pasture = await this.rawRepo.findOne({ where: { id } });
        if (!pasture) throw new RanchPastureNotFoundException(id);
        await this.rawRepo.remove(pasture);
    }
}
