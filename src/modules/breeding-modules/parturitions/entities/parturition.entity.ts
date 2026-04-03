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

    @PrimaryGeneratedColumn({
        name: 'id_parturition',
    })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'id_diagnosis', type: 'bigint', nullable: false })
    idDiagnosis: number;

    @Column({ name: 'id_cria', type: 'bigint', nullable: true })
    idCria?: number;

    @Column({
        name: 'birth_type',
        type: 'varchar',
        length: 20,
    })
    birthType: BirthTypeEnum;

    @Column({
        name: 'cria_weight',
        type: 'int',
        nullable: true,
    })
    criaWeight?: number;

    @Column({
        name: 'cria_status',
        type: 'varchar',
        length: 20,
    })
    criaStatus: CriaStatusEnum;

    @Column({
        name: 'mother_condition',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    motherCondition?: MotherConditionEnum;

    @ManyToOne(() => AnimalEvent, (event) => event.parturitions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @OneToOne(() => GestationDiagnosis, (diag) => diag.parturitions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_diagnosis' })
    diagnosis?: GestationDiagnosis;

    @ManyToOne(() => RanchAnimal, (animal) => animal.parturitionsAsCria, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_cria' })
    cria?: RanchAnimal;
}