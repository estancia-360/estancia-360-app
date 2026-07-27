import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { AnimalBreed } from 'src/modules/ranch-management/animal-breeds/entities/animal-breed.entity';
import { AnimalStatus } from 'src/modules/ranch-management/animal-statuses/entities/animal-status.entity';
import { AnimalClass } from 'src/modules/core/animal-classes/entities/animal-class.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';

@Entity('ranch_animals')
@Check(`sex IN ('F','M')`)
export class RanchAnimal extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_ranch_animal', type: 'bigint' })
    id: number;

    @Column({ name: 'id_ranch', type: 'int' })
    idRanch: number;

    @Column({ name: 'id_mother', type: 'bigint', nullable: true })
    idMother?: number;

    @Column({ name: 'id_father', type: 'bigint', nullable: true })
    idFather?: number;

    @Column({ name: 'id_breed', type: 'int' })
    idBreed: number;

    @Column({ name: 'id_status', type: 'int' })
    idStatus: number;

    @Column({ name: 'id_productive_status', type: 'int', nullable: true })
    idProductiveStatus?: number;

    @Column({ name: 'id_animal_class', type: 'int' })
    idAnimalClass: number;

    @Column({ name: 'id_lot', type: 'bigint', nullable: true })
    idLot?: number;

    @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
    code: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'birthdate', type: 'date' })
    birthdate: Date;

    @Column({ name: 'weight', type: 'numeric', precision: 6, scale: 2, nullable: true })
    weight?: number;

    @Column({ name: 'sex', type: 'char', length: 1 })
    sex: 'F' | 'M';

    @Column({ name: 'origin', type: 'varchar', length: 300, nullable: true })
    origin?: string;

    @ManyToOne(() => Ranch)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => AnimalBreed)
    @JoinColumn({ name: 'id_breed' })
    breed?: AnimalBreed;

    @ManyToOne(() => AnimalStatus)
    @JoinColumn({ name: 'id_status' })
    status?: AnimalStatus;

    @ManyToOne(() => AnimalClass)
    @JoinColumn({ name: 'id_animal_class' })
    animalClass?: AnimalClass;

    @ManyToOne(() => RanchLot)
    @JoinColumn({ name: 'id_lot' })
    lot?: RanchLot;
}
