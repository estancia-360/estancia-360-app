import { BaseCreatedUpdated } from "src/infrastructure/database/utils";
import { City } from "src/modules/core/cities/entities/city.entity";
import { ProductionType } from "src/modules/core/production-types/entities/production-type.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RanchUser } from "../../ranch-users/entities/ranch-user.entity";
import { RanchAnimal } from "../../ranch-animals/entities/ranch-animal.entity";
import { User } from "src/modules/user-management/users/entities/user.entity";
import { RanchPasture } from "../../ranch-pastures/entities/ranch-pasture.entity";
import { RanchLot } from "../../ranch-lots/entities/ranch-lot.entity";

@Entity('ranches')
export class Ranch extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_ranch' })
    id: number;

    @Column({
        name: 'id_city',
        type: 'int',
    })
    idCity: number;

    @Column({
        name: 'id_production_type',
        type: 'int',
    })
    idProductionType: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 200,
    })
    name: string;

    @ManyToOne(() => ProductionType, (type) => type.ranches)
    @JoinColumn({ name: 'id_production_type' })
    productionType: ProductionType;

    @ManyToOne(() => City, (city) => city.ranches)
    @JoinColumn({ name: 'id_city' })
    city: City;

    @OneToMany(() => RanchUser,(ranchUser) => ranchUser.ranch)
    ranchUsers: RanchUser[]

    @OneToMany(() => RanchAnimal,(animal) => animal.ranch)
    animals?: RanchAnimal[]

    @ManyToMany(() => User,(user) => user.ranches)
    users: User[]

    @OneToMany(() => RanchPasture,(rp) => rp.ranch)
    pastures?: RanchPasture[]

    @OneToMany(() => RanchLot,(lot) => lot.ranch)
    lots?: RanchLot[]
}
