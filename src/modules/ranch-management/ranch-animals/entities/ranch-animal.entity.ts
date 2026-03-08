import { BaseCreated } from "src/infrastructure/database/utils";
import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AnimalBreed } from "../../animal-breeds/entities/animal-breed.entity";
import { AnimalStatus } from "../../animal-statuses/entities/animal-status.entity";
import { Ranch } from "../../ranches/entities/ranch.entity";

@Entity('ranch_animals')
@Check(`sex IN ('F','M')`)
export class RanchAnimal extends BaseCreated {
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

    @Column({ name: 'is_castrated', type: 'boolean', nullable: true })
    isCastrated?: boolean;

    @Column({ name: 'is_sterilized', type: 'boolean', nullable: true })
    isSterilized?: boolean;

    @Column({ name: 'has_calved', type: 'boolean', nullable: true })
    hasCalved?: boolean;

    @ManyToOne(() => Ranch, (ranch) => ranch.animals)
    @JoinColumn({ name: 'id_ranch' })
    ranch: Ranch;

    @ManyToOne(() => AnimalBreed, (breed) => breed.animals)
    @JoinColumn({ name: 'id_breed' })
    breed: AnimalBreed;

    @ManyToOne(() => AnimalStatus, (status) => status.animals)
    @JoinColumn({ name: 'id_status' })
    status: AnimalStatus;


}