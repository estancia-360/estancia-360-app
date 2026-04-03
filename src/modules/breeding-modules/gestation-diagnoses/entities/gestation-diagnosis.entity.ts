import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BreedingService } from '../../breeding-services/entities/breeding-service.entity';
import { Parturition } from '../../parturitions/entities/parturition.entity';

export enum GestationMethodEnum {
    PALPATION = 'palpation',
    ULTRASOUND = 'ultrasound',
}

export enum GestationResultEnum {
    PREGNANT = 'pregnant',
    EMPTY = 'empty',
}

@Entity('gestation_diagnoses')
export class GestationDiagnosis extends BaseCreatedUpdated {

    @PrimaryGeneratedColumn({
        name: 'id_diagnosis',
    })
    id: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'id_service', type: 'bigint', nullable: false })
    idService: number;

    @Column({
        name: 'method',
        type: 'varchar',
        length: 20,
    })
    method: GestationMethodEnum;

    @Column({
        name: 'result',
        type: 'varchar',
        length: 20,
    })
    result: GestationResultEnum;

    @Column({
        name: 'gestation_days',
        type: 'int',
        nullable: true,
    })
    gestationDays?: number;

    @Column({
        name: 'estimated_birth',
        type: 'date',
        nullable: true,
    })
    estimatedBirth?: Date;

    @Column({
        name: 'veterinarian',
        type: 'varchar',
        length: 150,
        nullable: true,
    })
    veterinarian?: string;

    @ManyToOne(() => AnimalEvent, (event) => event.gestationDiagnoses, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @OneToOne(() => BreedingService, (service) => service.gestationDiagnoses, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_service' })
    service?: BreedingService;

    @OneToOne(() => Parturition,(p) => p.diagnosis)
    parturitions?: Parturition
}