import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { City } from 'src/modules/core/cities/entities/city.entity';
import { RanchUser } from 'src/modules/ranch-management/ranch-users/entities/ranch-user.entity';
import { RanchProductionType } from 'src/modules/ranch-management/ranch-production-types/entities/ranch-production-type.entity';
import { RanchPasture } from 'src/modules/ranch-management/ranch-pastures/entities/ranch-pasture.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';

@Entity('ranches')
export class Ranch extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_ranch' })
    id: number;

    @Column({ name: 'id_city', type: 'int' })
    idCity: number;

    @Column({ name: 'name', type: 'varchar', length: 200 })
    name: string;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'id_city' })
    city: City;

    @OneToMany(() => RanchUser, (ranchUser) => ranchUser.ranch)
    ranchUsers: RanchUser[];

    @OneToMany(() => RanchProductionType, (rpt) => rpt.ranch)
    productionTypes: RanchProductionType[];

    @OneToMany(() => RanchPasture, (pasture) => pasture.ranch)
    pastures: RanchPasture[];

    @OneToMany(() => RanchLot, (lot) => lot.ranch)
    lots: RanchLot[];
}
