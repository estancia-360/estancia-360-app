import { BaseEntityTurnable } from 'src/infrastructure/database/utils';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('production_types')
export class ProductionType extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_type' })
    id: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 30,
    })
    name: string;

    @OneToMany(() => Ranch,(ranch) => ranch.productionType)
    ranches: Ranch[]
}
