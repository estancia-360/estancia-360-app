import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RanchPasture } from '../../ranch-pastures/entities/ranch-pasture.entity';
import { Ranch } from '../../ranches/entities/ranch.entity';
import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { RanchAnimal } from '../../ranch-animals/entities/ranch-animal.entity';
import { LotTypesEnum } from 'src/shared/enums';

@Entity('ranch_lots')
export class RanchLot extends BaseCreatedUpdated {

    @PrimaryGeneratedColumn({
        name: 'id_lot',
        type: 'bigint',
    })
    id: number;

    @Column({ name: 'id_ranch', type: 'bigint' })
    idRanch: number

    @Column({ name: 'id_ranch_pasture', type: 'bigint' })
    idRanchPasture: number

    @Column({
        name: 'name',
        type: 'varchar',
        length: 50,
    })
    name: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({
        name: 'lot_type',
        type: 'varchar',
        length: 30,
        enum: LotTypesEnum,
    })
    lotType: LotTypesEnum;

    @Column({
        name: 'capacity',
        type: 'int',
        nullable: true,
    })
    capacity: number | null;

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive: boolean;

    @ManyToOne(() => Ranch, (ranch) => ranch.lots)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => RanchPasture, (pasture) => pasture.lots)
    @JoinColumn({ name: 'id_ranch_pasture' })
    pasture?: RanchPasture;

    @OneToMany(() => RanchAnimal, (ra) => ra.lot)
    animals?: RanchAnimal
}