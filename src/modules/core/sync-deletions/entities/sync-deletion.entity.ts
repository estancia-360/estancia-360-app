import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_deletions')
export class SyncDeletion {
    @PrimaryGeneratedColumn({ name: 'id_deletion', type: 'bigint' })
    id: number;

    @Column({ name: 'id_ranch', type: 'bigint' })
    idRanch: number;

    @Column({ name: 'table_name', type: 'varchar', length: 50 })
    tableName: string;

    @Column({ name: 'record_id', type: 'bigint' })
    recordId: number;

    @CreateDateColumn({ name: 'deleted_at', type: 'timestamp' })
    deletedAt: Date;
}
