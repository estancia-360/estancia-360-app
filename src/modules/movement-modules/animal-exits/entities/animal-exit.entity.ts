import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';

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

    @Column({ name: 'id_event', type: 'bigint' })
    idEvent: number;

    @Column({ name: 'reason', type: 'varchar', length: 30 })
    reason: ExitReasonEnum;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
