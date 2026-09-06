import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, LessThanOrEqual, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDto } from '../dto/user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserNotFoundException, UserAlreadyExistsException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, MutationOptions } from 'src/shared/dto';
import { hashPassword } from 'src/shared/utils/crypto.util';
import { RanchRolesEnum } from 'src/shared/enums/ranch-roles.enum';
import { RoleEnum } from 'src/shared/enums/role.enum';

@Injectable()
export class UsersService {
    private readonly repo: DtoRepository<User>;

    constructor(
        @InjectRepository(User)
        private readonly rawRepo: Repository<User>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        return this._findOne(dto, { id, isDeleted: false }, throwException);
    }

    findOneByEmail<T>(dto: new () => T, email: string, options: { throwException: false }): Promise<T | null>;
    findOneByEmail<T>(dto: new () => T, email: string, options?: FindOptions): Promise<T>;
    async findOneByEmail<T>(dto: new () => T, email: string, { throwException = true }: FindOptions = {}): Promise<T | null> {
        return this._findOne(dto, { email, isDeleted: false }, throwException);
    }

    findOneByCi<T>(dto: new () => T, ci: string, options: { throwException: false }): Promise<T | null>;
    findOneByCi<T>(dto: new () => T, ci: string, options?: FindOptions): Promise<T>;
    async findOneByCi<T>(dto: new () => T, ci: string, { throwException = true }: FindOptions = {}): Promise<T | null> {
        return this._findOne(dto, { ci, isDeleted: false }, throwException);
    }

    /** Root + Admin users, for the admin panel's user-management screen. */
    async findAllAdmins<T>(dto: new () => T): Promise<T[]> {
        return this.repo.find({
            dto,
            where: { roleId: LessThanOrEqual(RoleEnum.ADMIN), isDeleted: false },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Estancias donde el usuario es OWNER (puede ser dueño de varias). Query cruda
     * contra ranch_users/ranches para evitar que user-management importe
     * ranch-management horizontalmente (módulos atómicos).
     */
    async findRanchesWhereUserIsOwner(idUser: number): Promise<{ id: number; name: string }[]> {
        const result = await this.dataSource.query(
            `SELECT r.id_ranch AS id, r.name FROM ranch_users ru
             INNER JOIN ranches r ON r.id_ranch = ru.id_ranch
             WHERE ru.id_user = $1 AND ru.id_role = $2
             ORDER BY r.name ASC`,
            [idUser, RanchRolesEnum.OWNER],
        );
        return result.map((row: { id: string; name: string }) => ({ id: Number(row.id), name: row.name }));
    }

    // ── Mutations ─────────────────────────────────────────────────────────────

    async create<T>(returnDto: new () => T, dto: CreateUserDto, options?: MutationOptions): Promise<T> {
        const repo = options?.manager?.getRepository(User) ?? this.rawRepo;

        if (await repo.existsBy({ email: dto.email.trim(), isDeleted: false })) throw new UserAlreadyExistsException();
        if (await repo.existsBy({ ci: dto.ci.trim(), isDeleted: false })) throw new UserAlreadyExistsException();

        const user = repo.create();
        user.roleId = dto.roleId;
        user.ci = dto.ci.trim();
        user.fullname = dto.fullname.trim();
        user.paternalSurname = dto.paternalSurname.trim();
        user.maternalSurname = dto.maternalSurname.trim();
        user.email = dto.email.trim();
        user.password = await hashPassword(dto.password);
        user.celphone = dto.celphone?.trim() ?? null;

        // BUG-10 (auditoria QA E2E, 2026-09-03): los chequeos de arriba no cierran la condicion
        // de carrera (dos registros simultaneos con el mismo email/ci); el indice unico parcial
        // en la entidad es la proteccion real, esto solo evita que su violacion escape como 500.
        let saved: User;
        try {
            saved = await repo.save(user);
        } catch (error: any) {
            if (error?.code === '23505') throw new UserAlreadyExistsException();
            throw error;
        }

        const result = await new DtoRepository(repo).findOne({ dto: returnDto, where: { id: saved.id } });
        return result!;
    }

    /** Usado únicamente por PUT /auth/change-password. */
    async updatePasswordById(id: number, newPlainPassword: string): Promise<UserDto> {
        await this.rawRepo.update({ id }, { password: await hashPassword(newPlainPassword) });
        return (await this.repo.findOne({ dto: UserDto, where: { id } }))!;
    }

    /** Usado únicamente por POST /auth/forgot-password. Sobrescribe cualquier código pendiente anterior. */
    async setResetCode(id: number, hashedCode: string, expiresAt: Date): Promise<void> {
        await this.rawRepo.update({ id }, { resetCodeHash: hashedCode, resetCodeExpiresAt: expiresAt });
    }

    /** Usado únicamente por POST /auth/reset-password. Aplica la nueva contraseña y limpia el código usado. */
    async resetPasswordWithCode(id: number, newPlainPassword: string): Promise<UserDto> {
        await this.rawRepo.update(
            { id },
            { password: await hashPassword(newPlainPassword), resetCodeHash: null, resetCodeExpiresAt: null },
        );
        return (await this.repo.findOne({ dto: UserDto, where: { id } }))!;
    }

    // ── Private implementation ────────────────────────────────────────────────

    private async _findOne<T>(dto: new () => T, where: FindOptionsWhere<User>, throwException: boolean): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where });
        if (!result && throwException) throw new UserNotFoundException();
        return result;
    }
}
