import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum ExitReasonEnum {
    DEATH = 'death',
    DISCARD = 'discard',
    LOSS = 'loss',
    OTHER = 'other',
}

@Entity('animal_exits')
export class AnimalExit extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_exit', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'reason', type: 'varchar', length: 30, nullable: false })
    reason: ExitReasonEnum;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
