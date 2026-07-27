import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RanchUser } from '../entities/ranch-user.entity';
import { DtoRepository } from 'src/shared/orm';
import { RanchRolesEnum } from 'src/shared/enums';

export interface CreateRanchUserData {
    idUser: number;
    idRanch: number;
    idRanchRole: number;
}

@Injectable()
export class RanchUsersService {
    private readonly repo: DtoRepository<RanchUser>;

    constructor(
        @InjectRepository(RanchUser)
        private readonly rawRepo: Repository<RanchUser>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    async create(data: CreateRanchUserData, manager?: EntityManager): Promise<RanchUser> {
        const repo = manager?.getRepository(RanchUser) ?? this.rawRepo;

        const ranchUser = repo.create();
        ranchUser.idUser = data.idUser;
        ranchUser.idRanch = data.idRanch;
        ranchUser.idRole = data.idRanchRole;

        return await repo.save(ranchUser);
    }

    async findAllByUser<T>(dto: new () => T, idUser: number): Promise<T[]> {
        return this.repo.find({ dto, where: { idUser } });
    }

    /** Used by /sync/ranches — needs ranch.name and role.name, not covered by a DTO template. */
    async findEntitiesByUser(idUser: number): Promise<RanchUser[]> {
        return await this.rawRepo.find({ where: { idUser }, relations: { ranch: true, role: true } });
    }

    async findOne(idUser: number, idRanch: number): Promise<RanchUser | null> {
        return this.rawRepo.findOne({ where: { idUser, idRanch } });
    }

    async findAllByRanch<T>(dto: new () => T, idRanch: number): Promise<T[]> {
        return this.repo.find({ dto, where: { idRanch }, order: { createdAt: 'ASC' } });
    }

    async isOwner(idUser: number, idRanch: number): Promise<boolean> {
        const membership = await this.findOne(idUser, idRanch);
        return membership?.idRole === RanchRolesEnum.OWNER;
    }
}
