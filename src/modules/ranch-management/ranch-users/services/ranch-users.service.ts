import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
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
        // (id_user, id_ranch) es la PK compuesta de esta tabla — si ya existia una fila
        // eliminada logicamente para el mismo par (a alguien se lo eliminó y se lo vuelve a
        // agregar), TypeORM hace UPDATE en vez de INSERT. Sin esto, is_deleted se quedaba en
        // true: la respuesta decia "agregado" pero la persona seguia sin acceso, en silencio.
        ranchUser.isDeleted = false;

        return await repo.save(ranchUser);
    }

    async findAllByUser<T>(dto: new () => T, idUser: number): Promise<T[]> {
        return this.repo.find({ dto, where: { idUser } });
    }

    /** Used by /sync/ranches — needs ranch.name and role.name, not covered by a DTO template. */
    async findEntitiesByUser(idUser: number): Promise<RanchUser[]> {
        return await this.rawRepo.find({ where: { idUser }, relations: { ranch: true, role: true } });
    }

    // SEC-002 (auditoria QA, 2026-08-25): antes no filtraba is_deleted — una membresia
    // eliminada logicamente seguia autorizando todo, porque assertMember/isOwner llaman
    // a esta funcion como unico punto de verdad.
    async findOne(idUser: number, idRanch: number): Promise<RanchUser | null> {
        return this.rawRepo.findOne({ where: { idUser, idRanch, isDeleted: false } });
    }

    async findAllByRanch<T>(dto: new () => T, idRanch: number): Promise<T[]> {
        return this.repo.find({ dto, where: { idRanch, isDeleted: false }, order: { createdAt: 'ASC' } });
    }

    async isOwner(idUser: number, idRanch: number): Promise<boolean> {
        const membership = await this.findOne(idUser, idRanch);
        return membership?.idRole === RanchRolesEnum.OWNER;
    }

    /**
     * Ya no existe un rol "Trabajador" asignable — dentro de una estancia solo hay Dueño y
     * Administrador (subordinado al Dueño). Este método (soft-delete vía is_deleted, igual
     * patrón que el resto del proyecto) es el reverso de create(): saca a un Administrador de
     * la estancia. El Dueño nunca puede eliminarse por esta vía — si hace falta transferir la
     * propiedad, es un flujo distinto que no existe todavía.
     */
    async remove(idUser: number, idRanch: number): Promise<void> {
        const membership = await this.findOne(idUser, idRanch);
        if (!membership) {
            throw new NotFoundException({ message: `User ID=${idUser} is not a member of ranch ID=${idRanch}.`, error: 'RANCH_MEMBER_NOT_FOUND' });
        }
        if (membership.idRole === RanchRolesEnum.OWNER) {
            throw new ForbiddenException({ message: 'The ranch Owner cannot be removed.', error: 'CANNOT_REMOVE_OWNER' });
        }
        membership.isDeleted = true;
        await this.rawRepo.save(membership);
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

    /**
     * BUG-09 (auditoria QA E2E, 2026-09-03): usado por GET /users/:idUser y
     * GET /users/ranches/:idUser, que antes dejaban leer los datos de CUALQUIER usuario
     * (incluida su lista de estancias y rol en cada una) con solo autenticarse y adivinar
     * un idUser — enumeracion libre de usuarios. Todavia no existe un modelo de permisos
     * mas fino (ej. admin global viendo cualquier usuario), asi que el minimo razonable es
     * restringir a "uno mismo" o "alguien que comparte al menos una estancia conmigo".
     */
    async assertSharesRanchOrSelf(idUser: number, idTargetUser: number): Promise<void> {
        if (idUser === idTargetUser) return;
        const myRanches = await this.rawRepo.find({ where: { idUser, isDeleted: false }, select: { idRanch: true } });
        const idRanches = myRanches.map((r) => r.idRanch);
        const shared = idRanches.length > 0 ? await this.rawRepo.findOne({ where: { idUser: idTargetUser, idRanch: In(idRanches), isDeleted: false } }) : null;
        if (!shared) {
            throw new ForbiddenException({ message: `User ID=${idUser} has no relation to user ID=${idTargetUser}.`, error: 'USER_ACCESS_DENIED' });
        }
    }
}
