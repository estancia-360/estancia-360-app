import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { Ranch } from '../../ranches/entities/ranch.entity';
import { RanchLot } from '../../ranch-lots/entities/ranch-lot.entity';

@Entity('ranch_pastures')
export class RanchPasture extends BaseCreatedUpdated  {

    @PrimaryGeneratedColumn({
        name: 'id_ranch_pasture',
        type: 'bigint',
    })
    id: number;

    @Column({ name: 'id_ranch', type: 'bigint' })
    idRanch: number

    @Column({
        name: 'name',
        type: 'varchar',
        length: 50,
    })
    name: string;

    @Column({
        name: 'area_hectares',
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    areaHectares: number;

    @Column({
        name: 'description',
        type: 'text',
        nullable: true,
    })
    description?: string;

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive: boolean;

    @ManyToOne(() => Ranch, (ranch) => ranch.pastures)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @OneToMany(() => RanchLot,(lot) => lot.pasture)
    lots?: RanchLot[]
}