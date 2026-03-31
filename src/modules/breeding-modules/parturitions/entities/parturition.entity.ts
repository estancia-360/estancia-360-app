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

export const BIRTH_TYPES = ['normal', 'assisted', 'cesarean'] as const;
export const CRIA_STATUS = ['alive', 'dead'] as const;
export const MOTHER_CONDITION = ['good', 'regular', 'bad'] as const;

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
    birthType: typeof BIRTH_TYPES[number];

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
    criaStatus: typeof CRIA_STATUS[number];

    @Column({
        name: 'mother_condition',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    motherCondition?: typeof MOTHER_CONDITION[number];

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