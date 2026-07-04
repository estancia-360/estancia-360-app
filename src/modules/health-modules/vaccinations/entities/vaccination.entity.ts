import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vaccinations')
export class Vaccination extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_vaccination', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'vaccine_name', type: 'varchar', length: 150, nullable: false })
    vaccineName: string;

    @Column({ name: 'dose', type: 'varchar', length: 50, nullable: true })
    dose?: string;

    @Column({ name: 'responsible', type: 'varchar', length: 150, nullable: true })
    responsible?: string;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
