import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

@Entity('animal_declared_history')
export class AnimalDeclaredHistory extends BaseCreatedUpdated {

    @PrimaryGeneratedColumn({
        name: 'id_history',
        type: 'bigint',
    })
    id: number;

    @Column({ name: 'id_ranch_animal', type: 'bigint', nullable: false })
    idRanchAnimal: number;

    @Column({
        name: 'prev_births_count',
        type: 'int',
        nullable: true,
    })
    prevBirthsCount?: number;

    @Column({
        name: 'prev_last_birth_year',
        type: 'int',
        nullable: true,
    })
    prevLastBirthYear?: number;

    @Column({
        name: 'prev_avg_weaning_weight',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    prevAvgWeaningWeight?: number;

    @Column({
        name: 'notes',
        type: 'text',
        nullable: true,
    })
    notes?: string;

    /**
     * Relación inversa con el animal. La FK física en la tabla es id_ranch_animal,
     * que ya está mapeada como @Column arriba. El @JoinColumn aquí apunta al mismo
     * nombre de columna para que TypeORM construya los JOINs correctamente.
     */
    @OneToOne(() => RanchAnimal, (animal) => animal.declaredHistory)
    @JoinColumn({ name: 'id_ranch_animal' })
    animal?: RanchAnimal;
}