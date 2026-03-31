import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RanchAnimal } from '../../ranch-animals/entities/ranch-animal.entity';
import { EventType } from 'src/modules/core/event-types/entities/event-type.entity';
import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { BreedingService } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';
import { GestationDiagnosis } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';
import { Parturition } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';

@Entity('animal_events')
export class AnimalEvent extends BaseCreatedUpdated{

    @PrimaryGeneratedColumn({
        name: 'id_animal_event',
        type: 'bigint',
    })
    id: number;

    @Column({ name: 'id_ranch_animal', type: 'bigint' })
    idRanchAnimal: number

    @Column({ name: 'id_event_type', type: 'int' })
    idEventType: number

    @Column({
        name: 'notes',
        type: 'text',
        nullable: true,
    })
    notes?: string;

    @Column({
        name: 'is_synced',
        type: 'boolean',
        default: false,
    })
    isSynced: boolean;

    @Column({
        name: 'event_date',
        type: 'timestamp',
    })
    eventDate: Date;

    @ManyToOne(() => RanchAnimal, (animal) => animal.events)
    @JoinColumn({ name: 'id_ranch_animal' })
    animal?: RanchAnimal;

    @ManyToOne(() => EventType, (et) => et.events)
    @JoinColumn({ name: 'id_event_type' })
    eventType?: EventType;
    
    @OneToMany(() => BreedingService, (service) => service.event)
    breedingServices?: BreedingService[]

    @OneToMany(() => GestationDiagnosis,(gd) => gd.event)
    gestationDiagnoses?: GestationDiagnosis[]

    @OneToMany(() => Parturition,(p) => p.event)
    parturitions?: Parturition[]
}