import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { GestationDiagnosis } from '../../gestation-diagnoses/entities/gestation-diagnosis.entity';

export enum ServiceType {
    NATURAL = 'natural',
    ARTIFICIAL_INSEMINATION = 'artificial_insemination',
    EMBRYO_TRANSFER = 'embryo_transfer',
}
export const SERVICE_TYPES = [
  'natural',
  'artificial_insemination',
  'embryo_transfer',
] as const;

@Entity('breeding_services')
export class BreedingService extends BaseCreatedUpdated {

    @PrimaryGeneratedColumn({
        name: 'id_service',
    })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number

    @Column({ name: 'id_animal_male', type: 'bigint', nullable: true })
    idAnimalMale?: number

    @Column({
        name: 'service_type',
        type: 'enum',
        enum: ServiceType,
    })
    serviceType: 'natural' | 'artificial' | 'embryo_transfer';

    @Column({
        name: 'semen_breed',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    semenBreed?: string;

    @Column({
        name: 'technician',
        type: 'varchar',
        length: 150,
        nullable: true,
    })
    technician?: string;

    @Column({
        name: 'reproductive_lot',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    reproductiveLot?: string;

    @ManyToOne(() => AnimalEvent, (event) => event.breedingServices)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @ManyToOne(() => RanchAnimal, (ra) => ra.breedingService)
    @JoinColumn({ name: 'id_animal_male' })
    animalMale?: RanchAnimal;

    @OneToOne(() => GestationDiagnosis,(gd) => gd.service)
    gestationDiagnoses?: GestationDiagnosis
}