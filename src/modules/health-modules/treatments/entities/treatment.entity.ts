import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('treatments')
export class Treatment extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_treatment', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'illness', type: 'varchar', length: 150, nullable: true })
    illness?: string;

    @Column({ name: 'medication', type: 'varchar', length: 150, nullable: false })
    medication: string;

    @Column({ name: 'dose', type: 'varchar', length: 50, nullable: true })
    dose?: string;

    @Column({ name: 'duration_days', type: 'int', nullable: true })
    durationDays?: number;

    @Column({ name: 'withdrawal_days', type: 'int', nullable: true })
    withdrawalDays?: number;

    @Column({ name: 'withdrawal_end_date', type: 'date', nullable: true })
    withdrawalEndDate?: Date;

    @Column({ name: 'responsible', type: 'varchar', length: 150, nullable: true })
    responsible?: string;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
