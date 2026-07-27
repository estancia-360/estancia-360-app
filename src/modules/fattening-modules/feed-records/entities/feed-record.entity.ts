import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { User } from 'src/modules/user-management/users/entities/user.entity';

@Entity('feed_records')
export class FeedRecord extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_feed', type: 'bigint' })
    id: number;

    @Column({ name: 'id_lot', type: 'bigint' })
    idLot: number;

    @Column({ name: 'id_user', type: 'bigint', nullable: true })
    idUser?: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'feed_date', type: 'date' })
    feedDate: Date;

    @Column({ name: 'feed_type', type: 'varchar', length: 150 })
    feedType: string;

    @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2, nullable: true })
    quantity?: number;

    @Column({ name: 'unit', type: 'varchar', length: 20, nullable: true })
    unit?: string;

    @Column({ name: 'cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost?: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'is_synced', type: 'boolean', default: false })
    isSynced: boolean;

    @ManyToOne(() => RanchLot)
    @JoinColumn({ name: 'id_lot' })
    lot?: RanchLot;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_user' })
    user?: User;
}
