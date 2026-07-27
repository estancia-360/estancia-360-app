import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SyncDeletion } from '../entities/sync-deletion.entity';

@Injectable()
export class SyncDeletionsService {
    constructor(
        @InjectRepository(SyncDeletion)
        private readonly rawRepo: Repository<SyncDeletion>,
    ) {}

    async log(tableName: string, recordId: number, idRanch: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(SyncDeletion) ?? this.rawRepo;
        await repo.save(repo.create({ tableName, recordId, idRanch }));
    }
}
