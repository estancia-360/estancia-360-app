import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { GestationDiagnosis } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

export enum BirthTypeEnum {
    NORMAL = 'normal',
    ASSISTED = 'assisted',
    CESAREAN = 'cesarean',
}

export enum CriaStatusEnum {
    ALIVE = 'alive',
    DEAD = 'dead',
}

export enum MotherConditionEnum {
    GOOD = 'good',
    REGULAR = 'regular',
    BAD = 'bad',
}

@Entity('parturitions')
export class Parturition extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_parturition', type: 'bigint' })
    id: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'id_event', type: 'bigint' })
    idEvent: number;

    @Column({ name: 'id_diagnosis', type: 'bigint' })
    idDiagnosis: number;

    @Column({ name: 'id_cria', type: 'bigint', nullable: true })
    idCria?: number;

    @Column({ name: 'birth_type', type: 'varchar', length: 20 })
    birthType: BirthTypeEnum;

    @Column({ name: 'cria_weight', type: 'numeric', precision: 6, scale: 2, nullable: true })
    criaWeight?: number;

    @Column({ name: 'cria_status', type: 'varchar', length: 20 })
    criaStatus: CriaStatusEnum;

    @Column({ name: 'mother_condition', type: 'varchar', length: 20, nullable: true })
    motherCondition?: MotherConditionEnum;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @ManyToOne(() => GestationDiagnosis)
    @JoinColumn({ name: 'id_diagnosis' })
    diagnosis?: GestationDiagnosis;

    @ManyToOne(() => RanchAnimal)
    @JoinColumn({ name: 'id_cria' })
    cria?: RanchAnimal;
}
