import { BaseCreatedUpdated } from "src/infrastructure/database/utils";
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AnimalBreed } from "../../animal-breeds/entities/animal-breed.entity";
import { AnimalStatus } from "../../animal-statuses/entities/animal-status.entity";
import { Ranch } from "../../ranches/entities/ranch.entity";
import { ProductiveStatus } from "src/modules/core/productive-statuses/entities/productive-status.entity";
import { RanchLot } from "../../ranch-lots/entities/ranch-lot.entity";
import { AnimalEvent } from "../../animal-events/entities/animal-event.entity";
import { AnimalDeclaredHistory } from "src/modules/breeding-modules/animal-declared-history/entities/animal-declared-history.entity";
import { BreedingService } from "src/modules/breeding-modules/breeding-services/entities/breeding-service.entity";
import { Parturition } from "src/modules/breeding-modules/parturitions/entities/parturition.entity";
import { AnimalClass } from "src/modules/core/animal-classes/entities/animal-class.entity";

@Entity('ranch_animals')
@Check(`sex IN ('F','M')`)
export class RanchAnimal extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_ranch_animal' })
    id: number;

    @Column({ name: 'id_ranch', type: 'int', nullable: false })
    idRanch: number;

    @Column({ name: 'id_mother', type: 'bigint', nullable: true })
    idMother: number

    @Column({ name: 'id_father', type: 'bigint', nullable: true })
    idFather: number

    @Column({ name: 'id_breed', type: 'int', nullable: false })
    idBreed: number

    @Column({ name: 'id_status', type: 'int', nullable: false })
    idStatus: number

    @Column({ name: 'id_productive_status', type: 'int', nullable: true })
    idProductiveStatus: number

    @Column({ name: 'id_animal_class', type: 'int', nullable: false })
    idAnimalClass: number

    @Column({ name: 'id_lot', type: 'bigint', nullable: true })
    idLot?: number

    @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
    code: string;

    @Column({ name: 'birthdate', type: 'date' })
    birthdate: Date;

    @Column({
        name: 'weight',
        type: 'numeric',
        precision: 12,
        scale: 2,
        nullable: true
    })
    weight?: number;

    @Column({ name: 'sex', type: 'char', length: 1 })
    sex: 'F' | 'M';

    @Column({ name: 'origin', type: 'varchar', length: 300, nullable: true })
    origin: string

    @ManyToOne(() => Ranch, (ranch) => ranch.animals)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => AnimalBreed, (breed) => breed.animals)
    @JoinColumn({ name: 'id_breed' })
    breed?: AnimalBreed;

    @ManyToOne(() => AnimalStatus, (status) => status.animals)
    @JoinColumn({ name: 'id_status' })
    status?: AnimalStatus;

    @ManyToOne(() => ProductiveStatus,(ps) => ps.animals)
    @JoinColumn({ name: 'id_productive_status' })
    productiveStatus?: ProductiveStatus

    @ManyToOne(() => AnimalClass)
    @JoinColumn({ name: 'id_animal_class' })
    animalClass?: AnimalClass

    @ManyToOne(() => RanchLot,(lot) => lot.animals)
    @JoinColumn({ name: 'id_lot' })
    lot?: RanchLot

    @OneToMany(() => AnimalEvent,(ae) => ae.animal)
    events?: AnimalEvent[]

    @OneToOne(() => AnimalDeclaredHistory,(adh) => adh.animal)
    declaredHistory?: AnimalDeclaredHistory

    @OneToMany(() => BreedingService,(bs) => bs.animalMale)
    breedingService?: BreedingService[]

    @OneToMany(() => Parturition,(p) => p.cria)
    parturitionsAsCria?: Parturition[]
}