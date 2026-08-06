import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Like, Not, Or, Repository } from 'typeorm';
import { RanchAnimal } from '../entities/ranch-animal.entity';
import { CreateRanchAnimalDto } from '../dto/create-ranch-animal.dto';
import { UpdateRanchAnimalDto } from '../dto/update-ranch-animal.dto';
import { RanchAnimalPlainDto } from '../dto/ranch-animal-plain.dto';
import {
    RanchAnimalNotFoundException,
    RanchAnimalNotFoundByCodeException,
    AnimalCodeAlreadyExistsException,
    SameParentCodeException,
} from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';
import { RanchesService } from 'src/modules/ranch-management/ranches/services/ranches.service';
import { RanchDto } from 'src/modules/ranch-management/ranches/dto/ranch.dto';
import { AnimalStatusesService } from 'src/modules/ranch-management/animal-statuses/services/animal-statuses.service';
import { AnimalStatusDto } from 'src/modules/ranch-management/animal-statuses/dto/animal-status.dto';
import { AnimalBreedsService } from 'src/modules/ranch-management/animal-breeds/services/animal-breeds.service';
import { AnimalBreedDto } from 'src/modules/ranch-management/animal-breeds/dto/animal-breed.dto';
import { AnimalClassesService } from 'src/modules/core/animal-classes/services/animal-classes.service';
import { AnimalClassDto } from 'src/modules/core/animal-classes/dto/animal-class.dto';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';
import { PRODUCTIVE_STATUS_IDS } from 'src/shared/constants';
import { FindAllRanchAnimalsParamsDto } from '../dto/find-all-ranch-animals-params.dto';
import { PaginationResponseDto } from 'src/shared/dto';

@Injectable()
export class RanchAnimalsService {
    private readonly repo: DtoRepository<RanchAnimal>;

    constructor(
        @InjectRepository(RanchAnimal)
        private readonly rawRepo: Repository<RanchAnimal>,
        private readonly ranchesService: RanchesService,
        private readonly animalStatusesService: AnimalStatusesService,
        private readonly animalBreedsService: AnimalBreedsService,
        private readonly animalClassesService: AnimalClassesService,
        private readonly ranchSubscriptionsService: RanchSubscriptionsService,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create<T>(dto: CreateRanchAnimalDto, returnDto: new () => T): Promise<T> {
        const existingCode = await this.findOneByCode(RanchAnimalPlainDto, dto.idRanch, dto.code, { throwException: false });
        if (existingCode) throw new AnimalCodeAlreadyExistsException();

        const ranch = await this.ranchesService.findOneById(RanchDto, dto.idRanch);
        await this.animalStatusesService.findOneById(AnimalStatusDto, dto.idStatus);
        await this.animalBreedsService.findOneById(AnimalBreedDto, dto.idBreed);
        await this.animalClassesService.findOneById(AnimalClassDto, dto.idAnimalClass);

        if (dto.codeFather && dto.codeMother && dto.codeFather === dto.codeMother) {
            throw new SameParentCodeException();
        }

        const currentActiveCount = await this.countActiveByRanch(dto.idRanch);
        await this.ranchSubscriptionsService.assertCapacityAvailable(dto.idRanch, currentActiveCount, 1);

        const animal = this.rawRepo.create();
        if (dto.codeMother) {
            animal.idMother = (await this.findOneByCode(RanchAnimalPlainDto, dto.idRanch, dto.codeMother))!.id;
        }
        if (dto.codeFather) {
            animal.idFather = (await this.findOneByCode(RanchAnimalPlainDto, dto.idRanch, dto.codeFather))!.id;
        }
        animal.idRanch = ranch.id;
        animal.idStatus = dto.idStatus;
        animal.idBreed = dto.idBreed;
        animal.idAnimalClass = dto.idAnimalClass;
        animal.code = dto.code;
        animal.birthdate = dto.birthdate;
        if (dto.weight) animal.weight = dto.weight;
        animal.sex = dto.sex;
        animal.createdAt = dto.createdAt;
        if (dto.idLot) animal.idLot = dto.idLot;
        if (dto.idProductiveStatus) animal.idProductiveStatus = dto.idProductiveStatus;

        const saved = await this.rawRepo.save(animal);
        return (await this.findOneById(returnDto, saved.id))!;
    }

    async update<T>(id: number, dto: UpdateRanchAnimalDto, returnDto: new () => T): Promise<T> {
        if (dto.codeFather && dto.codeMother && dto.codeFather === dto.codeMother) {
            throw new SameParentCodeException();
        }

        const animal = await this.rawRepo.findOne({ where: { id } });
        if (!animal) throw new RanchAnimalNotFoundException(id);

        const targetRanch = animal.idRanch;
        if (dto.codeMother) {
            animal.idMother = (await this.findOneByCode(RanchAnimalPlainDto, targetRanch, dto.codeMother))!.id;
        }
        if (dto.codeFather) {
            animal.idFather = (await this.findOneByCode(RanchAnimalPlainDto, targetRanch, dto.codeFather))!.id;
        }
        if (dto.idStatus) {
            animal.idStatus = (await this.animalStatusesService.findOneById(AnimalStatusDto, dto.idStatus)).id;
        }
        if (dto.idBreed) {
            animal.idBreed = (await this.animalBreedsService.findOneById(AnimalBreedDto, dto.idBreed)).id;
        }
        if (dto.code) {
            const existingCode = await this.findOneByCode(RanchAnimalPlainDto, targetRanch, dto.code, { throwException: false });
            if (existingCode) throw new AnimalCodeAlreadyExistsException();
            animal.code = dto.code;
        }
        if (dto.idAnimalClass) {
            await this.animalClassesService.findOneById(AnimalClassDto, dto.idAnimalClass);
            animal.idAnimalClass = dto.idAnimalClass;
        }
        if (dto.birthdate) animal.birthdate = dto.birthdate;
        if (dto.weight) animal.weight = dto.weight;
        if (dto.sex) animal.sex = dto.sex;
        if (dto.createdAt) animal.createdAt = dto.createdAt;
        if (dto.idLot) animal.idLot = dto.idLot;
        if (dto.idProductiveStatus) animal.idProductiveStatus = dto.idProductiveStatus;

        const saved = await this.rawRepo.save(animal);
        return (await this.findOneById(returnDto, saved.id))!;
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new RanchAnimalNotFoundException(id);
        return result;
    }

    findOneByCode<T>(dto: new () => T, idRanch: number, code: string, options: { throwException: false }): Promise<T | null>;
    findOneByCode<T>(dto: new () => T, idRanch: number, code: string, options?: FindOptions): Promise<T>;
    async findOneByCode<T>(dto: new () => T, idRanch: number, code: string, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { idRanch, code } });
        if (!result && throwException) throw new RanchAnimalNotFoundByCodeException(code);
        return result;
    }

    /** Used by RegisterParturitionUseCase to create the calf inside the birth transaction. */
    async createCria(
        data: {
            idRanch: number;
            idBreed: number;
            idStatus: number;
            idAnimalClass: number;
            code: string;
            sex: 'F' | 'M';
            birthdate: Date;
            weight?: number;
            idMother?: number;
        },
        manager: EntityManager,
    ): Promise<RanchAnimal> {
        const repo = manager.getRepository(RanchAnimal);
        const cria = repo.create();
        cria.idRanch = data.idRanch;
        cria.idBreed = data.idBreed;
        cria.idStatus = data.idStatus;
        cria.idAnimalClass = data.idAnimalClass;
        cria.idProductiveStatus = PRODUCTIVE_STATUS_IDS.CRIA;
        cria.code = data.code;
        cria.sex = data.sex;
        cria.birthdate = data.birthdate;
        cria.origin = 'born';
        if (data.weight) cria.weight = data.weight;
        if (data.idMother) cria.idMother = data.idMother;
        return await repo.save(cria);
    }

    async countActiveByRanch(idRanch: number, manager?: EntityManager): Promise<number> {
        const repo = manager?.getRepository(RanchAnimal) ?? this.rawRepo;
        return await repo
            .createQueryBuilder('animal')
            .where('animal.idRanch = :idRanch', { idRanch })
            .andWhere('(animal.idProductiveStatus IS NULL OR animal.idProductiveStatus != :baja)', {
                baja: PRODUCTIVE_STATUS_IDS.BAJA,
            })
            .getCount();
    }

    /** Used by app/dashboard to build the herd breakdown by stage. */
    async countByProductiveStatus(idRanch: number, idProductiveStatus: number, manager?: EntityManager): Promise<number> {
        const repo = manager?.getRepository(RanchAnimal) ?? this.rawRepo;
        return await repo.count({ where: { idRanch, idProductiveStatus } });
    }

    /** Used by app/dashboard to count animals in quarantine (id_status=2). */
    async countByStatus(idRanch: number, idStatus: number, manager?: EntityManager): Promise<number> {
        const repo = manager?.getRepository(RanchAnimal) ?? this.rawRepo;
        return await repo.count({ where: { idRanch, idStatus } });
    }

    /** Used by app/dashboard for Recría/Engorde average weight. */
    async avgWeightByProductiveStatus(idRanch: number, idProductiveStatus: number, manager?: EntityManager): Promise<number | null> {
        const repo = manager?.getRepository(RanchAnimal) ?? this.rawRepo;
        const result = await repo
            .createQueryBuilder('animal')
            .select('AVG(animal.weight)', 'avg')
            .where('animal.idRanch = :idRanch', { idRanch })
            .andWhere('animal.idProductiveStatus = :idProductiveStatus', { idProductiveStatus })
            .andWhere('animal.weight IS NOT NULL')
            .getRawOne<{ avg: string | null }>();
        return result?.avg ? Number(result.avg) : null;
    }

    /** ps: 1 (Cría) → 2 (Recría). Used by RegisterWeaningUseCase. */
    async markIsWeaned(idRanchAnimal: number, manager: EntityManager): Promise<void> {
        await manager.update(
            RanchAnimal,
            { id: idRanchAnimal },
            { idProductiveStatus: PRODUCTIVE_STATUS_IDS.RECRIA, updatedAt: new Date() },
        );
    }

    /** ps: 2 (Recría) → 1 (Cría). Used by DeleteWeaningUseCase to undo a weaning. */
    async markIsNotWeaned(idRanchAnimal: number, manager: EntityManager): Promise<void> {
        await manager.update(
            RanchAnimal,
            { id: idRanchAnimal },
            { idProductiveStatus: PRODUCTIVE_STATUS_IDS.CRIA, updatedAt: new Date() },
        );
    }

    async findAll<T>(idRanch: number, params: FindAllRanchAnimalsParamsDto, dto: new () => T): Promise<PaginationResponseDto<T>> {
        return await this.repo.findPaginated({
            dto,
            pagination: params,
            where: {
                idRanch,
                ...(params.idBreed ? { idBreed: params.idBreed } : {}),
                ...(params.idMother ? { idMother: params.idMother } : {}),
                ...(params.idFather ? { idFather: params.idFather } : {}),
                ...(params.idStatus ? { idStatus: params.idStatus } : {}),
                ...(params.idAnimalClass ? { idAnimalClass: params.idAnimalClass } : {}),
                ...(params.code ? { code: Like(`%${params.code}%`) } : {}),
                ...(params.birthdate ? { birthdate: params.birthdate } : {}),
                ...(params.weight ? { weight: params.weight } : {}),
                ...(params.sex ? { sex: params.sex } : {}),
                ...(params.idProductiveStatus ? { idProductiveStatus: params.idProductiveStatus } : {}),
                ...(params.excludeProductiveStatus
                    ? { idProductiveStatus: Or(IsNull(), Not(params.excludeProductiveStatus)) }
                    : {}),
            },
        });
    }
}
