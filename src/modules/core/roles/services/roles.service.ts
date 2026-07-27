import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RoleDto } from '../dto/role.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleNotFoundException, RoleAlreadyExistsException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions, MutationOptions } from 'src/shared/dto';

@Injectable()
export class RolesService {
    private readonly repo: DtoRepository<Role>;

    constructor(
        @InjectRepository(Role)
        private readonly rawRepo: Repository<Role>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    // Catálogo chico (Root/Admin/Usuario) — el contrato viejo (GET /roles) devuelve
    // la lista completa sin paginar, envuelta en { roles }. Se mantiene así.
    async findAll<T>(dto: new () => T): Promise<T[]> {
        return this.repo.find({ dto, order: { id: 'ASC' } });
    }

    /**
     * Generic base — looks up a role matching any entity attribute combination.
     * Pass the DTO class to control which fields are selected and returned.
     */
    findOne<T>(dto: new () => T, where: FindOptionsWhere<Role>, options: { throwException: false }): Promise<T | null>;
    findOne<T>(dto: new () => T, where: FindOptionsWhere<Role>, options?: FindOptions): Promise<T>;
    async findOne<T>(dto: new () => T, where: FindOptionsWhere<Role>, { throwException = true }: FindOptions = {}): Promise<T | null> {
        return this._findOne(dto, where, throwException);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        return this._findOne(dto, { id }, throwException);
    }

    // ── Mutations ─────────────────────────────────────────────────────────────

    async create<T>(returnDto: new () => T, dto: CreateRoleDto, options?: MutationOptions): Promise<T> {
        const repo = options?.manager?.getRepository(Role) ?? this.rawRepo;

        if (await this.rawRepo.existsBy({ name: dto.name })) throw new RoleAlreadyExistsException();

        const role  = repo.create();
        role.name   = dto.name;

        const saved  = await repo.save(role);

        const result = await new DtoRepository(repo).findOne({ dto: returnDto, where: { id: saved.id } });
        return result!;
    }

    async update<T>(returnDto: new () => T, id: number, dto: UpdateRoleDto, options?: MutationOptions): Promise<T> {
        const repo = options?.manager?.getRepository(Role) ?? this.rawRepo;

        const current = await this.findOneById(RoleDto, id);

        if (dto.name && dto.name !== current.name) {
            if (await this.rawRepo.existsBy({ name: dto.name })) throw new RoleAlreadyExistsException();
        }

        const payload: Record<string, any> = {};
        if (dto.name !== undefined) payload.name = dto.name;

        await repo.update(id, payload);

        const result = await new DtoRepository(repo).findOne({ dto: returnDto, where: { id } });
        return result!;
    }

    // Role no tiene deleted_at (no hay soft-delete posible) — siempre hard delete.
    async remove(id: number, options?: Omit<MutationOptions, 'hardDelete'>): Promise<void> {
        const repo = options?.manager?.getRepository(Role) ?? this.rawRepo;
        await this.findOneById(RoleDto, id);
        await repo.delete(id);
    }

    // ── Private implementation ────────────────────────────────────────────────

    private async _findOne<T>(dto: new () => T, where: FindOptionsWhere<Role>, throwException: boolean): Promise<T | null> {
        const role = await this.repo.findOne({ dto, where });
        if (!role && throwException) throw new RoleNotFoundException();
        return role;
    }
}
