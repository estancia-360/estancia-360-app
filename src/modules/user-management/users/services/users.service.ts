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
     * ID de la estancia donde el usuario es OWNER (o null si no es dueño de ninguna).
     * Query cruda contra ranch_users porque ese módulo todavía no está migrado —
     * reemplazar por RanchUsersService cuando se migre ranch-management.
     */
    async findRanchIdWhereUserIsOwner(idUser: number): Promise<number | null> {
        const result = await this.dataSource.query(
            `SELECT id_ranch FROM ranch_users WHERE id_user = $1 AND id_role = $2 LIMIT 1`,
            [idUser, RanchRolesEnum.OWNER],
        );
        return result[0]?.id_ranch ?? null;
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

        const saved = await repo.save(user);

        const result = await new DtoRepository(repo).findOne({ dto: returnDto, where: { id: saved.id } });
        return result!;
    }

    /** Usado únicamente por PUT /auth/change-password — ver nota de deuda técnica en AuthService. */
    async updatePasswordByEmail(email: string, newPlainPassword: string): Promise<UserDto> {
        const user = await this._findOne(UserDto, { email, isDeleted: false }, true);
        await this.rawRepo.update({ id: user!.id }, { password: await hashPassword(newPlainPassword) });
        return (await this.repo.findOne({ dto: UserDto, where: { id: user!.id } }))!;
    }

    // ── Private implementation ────────────────────────────────────────────────

    private async _findOne<T>(dto: new () => T, where: FindOptionsWhere<User>, throwException: boolean): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where });
        if (!result && throwException) throw new UserNotFoundException();
        return result;
    }
}
