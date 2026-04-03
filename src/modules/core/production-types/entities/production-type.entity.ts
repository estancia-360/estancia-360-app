import { BaseEntityTurnable } from 'src/infrastructure/database/utils';
import { RanchProductionType } from 'src/modules/ranch-management/ranch-production-types/entities/ranch-production-type.entity';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';

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

    @OneToMany(() => RanchProductionType, (rpt) => rpt.productionType)
    ranchProductionTypes: RanchProductionType[]

    @ManyToMany(() => Ranch, (ranch) => ranch.productionTypesDirectly)
    ranches: Ranch[]
}
