import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('weanings')
export class Weaning extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({
        name: 'id_weaning',
        type: 'bigint',
    })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({
        name: 'weaning_weight',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    weaningWeight?: number;

    @Column({
        name: 'age_days',
        type: 'int',
        nullable: true,
    })
    ageDays?: number;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
