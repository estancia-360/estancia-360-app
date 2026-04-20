import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum RearingDestinationEnum {
    REPLACEMENT = 'replacement',
    FATTENING = 'fattening',
    SALE = 'sale',
}

@Entity('rearing_selections')
export class RearingSelection extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_selection', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'id_lot_dest', type: 'bigint', nullable: true })
    idLotDest?: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'destination', type: 'varchar', length: 20, nullable: false })
    destination: RearingDestinationEnum;

    @Column({ name: 'weight_at_selection', type: 'decimal', precision: 8, scale: 2, nullable: true })
    weightAtSelection?: number;

    @Column({ name: 'body_condition', type: 'smallint', nullable: true })
    bodyCondition?: number;

    @Column({ name: 'genetic_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
    geneticScore?: number;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @ManyToOne(() => RanchLot)
    @JoinColumn({ name: 'id_lot_dest' })
    lotDest?: RanchLot;
}
