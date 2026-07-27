import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { BreedingService } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';

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
    @PrimaryGeneratedColumn({ name: 'id_diagnosis' })
    id: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'id_event', type: 'bigint' })
    idEvent: number;

    @Column({ name: 'id_service', type: 'bigint' })
    idService: number;

    @Column({ name: 'method', type: 'varchar', length: 20 })
    method: GestationMethodEnum;

    @Column({ name: 'result', type: 'varchar', length: 20 })
    result: GestationResultEnum;

    @Column({ name: 'gestation_days', type: 'int', nullable: true })
    gestationDays?: number;

    @Column({ name: 'estimated_birth', type: 'date', nullable: true })
    estimatedBirth?: Date;

    @Column({ name: 'veterinarian', type: 'varchar', length: 150, nullable: true })
    veterinarian?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @ManyToOne(() => BreedingService)
    @JoinColumn({ name: 'id_service' })
    service?: BreedingService;
}
