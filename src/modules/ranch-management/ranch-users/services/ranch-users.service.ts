import { ForbiddenException, Injectable } from '@nestjs/common';
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

    /**
     * Punto único de chequeo "¿este usuario autenticado pertenece a esta estancia?".
     * Usar SIEMPRE que un endpoint reciba un idRanch (o algo que resuelva a un idRanch)
     * del lado del cliente — sin esto, cualquier usuario autenticado puede leer/mutar
     * datos de una estancia ajena con solo adivinar/incrementar un ID (IDOR).
     */
    async assertMember(idUser: number, idRanch: number): Promise<RanchUser> {
        const membership = await this.findOne(idUser, idRanch);
        if (!membership) {
            throw new ForbiddenException({ message: `User ID=${idUser} does not belong to ranch ID=${idRanch}.`, error: 'RANCH_ACCESS_DENIED' });
        }
        return membership;
    }

    async assertOwner(idUser: number, idRanch: number): Promise<void> {
        const membership = await this.assertMember(idUser, idRanch);
        if (membership.idRole !== RanchRolesEnum.OWNER) {
            throw new ForbiddenException({ message: 'Only the ranch Owner can perform this action (RN-01/RN-16).', error: 'ONLY_OWNER_ALLOWED' });
        }
    }
}
