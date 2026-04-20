import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum WeightTypeEnum {
    SCALE = 'scale',
    ESTIMATED = 'estimated',
}

@Entity('weight_records')
export class WeightRecord extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_weight', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'id_lot', type: 'bigint', nullable: false })
    idLot: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'weight', type: 'decimal', precision: 8, scale: 2, nullable: false })
    weight: number;

    @Column({ name: 'weight_type', type: 'varchar', length: 20, nullable: false })
    weightType: WeightTypeEnum;

    @Column({ name: 'body_condition', type: 'smallint', nullable: true })
    bodyCondition?: number;

    @Column({ name: 'age_days', type: 'int', nullable: true })
    ageDays?: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @ManyToOne(() => RanchLot)
    @JoinColumn({ name: 'id_lot' })
    lot?: RanchLot;
}
