import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';

export enum SystemTypeEnum {
    FIELD = 'field',
    FEEDLOT = 'feedlot',
}

@Entity('fattening_entries')
export class FatteningEntry extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_entry', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint' })
    idEvent: number;

    @Column({ name: 'system_type', type: 'varchar', length: 20 })
    systemType: SystemTypeEnum;

    @Column({ name: 'initial_weight', type: 'decimal', precision: 6, scale: 2, nullable: true })
    initialWeight?: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
