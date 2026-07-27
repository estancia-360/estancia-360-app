import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionType } from '../entities/production-type.entity';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';
import { ProductionTypeNotFoundException } from '../exceptions';

// Catálogo semilla — sin controller público, igual que el proyecto viejo
// (el CRUD ahí nunca se implementó, quedó como stub vacío del scaffold).
@Injectable()
export class ProductionTypesService {
    private readonly repo: DtoRepository<ProductionType>;

    constructor(
        @InjectRepository(ProductionType)
        rawRepo: Repository<ProductionType>,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id, isActive: true } });
        if (!result && throwException) throw new ProductionTypeNotFoundException();
        return result;
    }
}
