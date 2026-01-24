import { BaseCreatedUpdated } from "src/infrastructure/database/utils";
import { City } from "src/modules/core/cities/entities/city.entity";
import { ProductionType } from "src/modules/core/production-types/entities/production-type.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RanchUser } from "../../ranch-users/entities/ranch-user.entity";

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
}
