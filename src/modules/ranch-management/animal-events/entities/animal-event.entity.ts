import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

@Entity('animal_events')
export class AnimalEvent extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_animal_event', type: 'bigint' })
    id: number;

    @Column({ name: 'id_user', type: 'bigint', nullable: true })
    idUser?: number;

    @Column({ name: 'id_ranch_animal', type: 'bigint' })
    idRanchAnimal: number;

    @Column({ name: 'id_event_type', type: 'int' })
    idEventType: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'is_synced', type: 'boolean', default: false })
    isSynced: boolean;

    @Column({ name: 'event_date', type: 'timestamp' })
    eventDate: Date;

    @ManyToOne(() => RanchAnimal)
    @JoinColumn({ name: 'id_ranch_animal' })
    animal?: RanchAnimal;
}
