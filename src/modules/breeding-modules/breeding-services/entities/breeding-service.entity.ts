import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

export enum ServiceTypeEnum {
    NATURAL = 'natural',
    ARTIFICIAL_INSEMINATION = 'artificial_insemination',
    EMBRYO_TRANSFER = 'embryo_transfer',
}
export const SERVICE_TYPES = ['natural', 'artificial_insemination', 'embryo_transfer'] as const;

@Entity('breeding_services')
export class BreedingService extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_service' })
    id: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'id_event', type: 'bigint' })
    idEvent: number;

    @Column({ name: 'id_animal_male', type: 'bigint', nullable: true })
    idAnimalMale?: number;

    @Column({ name: 'service_type', type: 'varchar', length: 30 })
    serviceType: ServiceTypeEnum;

    @Column({ name: 'semen_breed', type: 'varchar', length: 100, nullable: true })
    semenBreed?: string;

    @Column({ name: 'technician', type: 'varchar', length: 150, nullable: true })
    technician?: string;

    @Column({ name: 'reproductive_lot', type: 'varchar', length: 100, nullable: true })
    reproductiveLot?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @ManyToOne(() => RanchAnimal)
    @JoinColumn({ name: 'id_animal_male' })
    animalMale?: RanchAnimal;
}
