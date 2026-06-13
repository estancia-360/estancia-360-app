import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SyncDeletion } from '../entities/sync-deletion.entity';

export interface SyncDeletionGroup {
    table: string;
    ids: number[];
}

@Injectable()
export class SyncDeletionsService {
    constructor(
        @InjectRepository(SyncDeletion)
        private readonly syncDeletionsRepository: Repository<SyncDeletion>,
    ) {}

    async log(tableName: string, recordId: number, idRanch: number, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(SyncDeletion) ?? this.syncDeletionsRepository;
        await repo.save(repo.create({ tableName, recordId, idRanch }));
    }

    async logBatch(tableName: string, recordIds: number[], idRanch: number, manager?: EntityManager): Promise<void> {
        if (recordIds.length === 0) return;
        const repo = manager?.getRepository(SyncDeletion) ?? this.syncDeletionsRepository;
        await repo.save(recordIds.map((recordId) => repo.create({ tableName, recordId, idRanch })));
    }

    async findSince(idRanch: number, since?: Date): Promise<SyncDeletionGroup[]> {
        const qb = this.syncDeletionsRepository
            .createQueryBuilder('d')
            .where('d.idRanch = :idRanch', { idRanch });
        if (since) qb.andWhere('d.deletedAt > :since', { since });

        const rows = await qb.getMany();

        const grouped = new Map<string, number[]>();
        for (const row of rows) {
            const ids = grouped.get(row.tableName) ?? [];
            ids.push(Number(row.recordId));
            grouped.set(row.tableName, ids);
        }
        return Array.from(grouped.entries()).map(([table, ids]) => ({ table, ids }));
    }
}
