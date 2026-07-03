import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum SystemTypeEnum {
    FIELD = 'field',
    FEEDLOT = 'feedlot',
}

@Entity('fattening_entries')
export class FatteningEntry extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_entry', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'initial_weight', type: 'decimal', precision: 6, scale: 2, nullable: true })
    initialWeight?: number;

    @Column({ name: 'system_type', type: 'varchar', length: 20, nullable: false })
    systemType: SystemTypeEnum;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
