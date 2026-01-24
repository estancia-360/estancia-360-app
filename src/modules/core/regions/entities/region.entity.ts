import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Country } from "../../countries/entities/country.entity";
import { BaseEntityTurnable } from "src/infrastructure/database/utils";
import { City } from "../../cities/entities/city.entity";

@Entity('regions')
export class Region extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_region' })
    id: number;

    @Column({
        name: 'id_country',
        type: 'int',
    })
    idCountry: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 100,
    })
    name: string;

    @ManyToOne(() => Country, (country) => country.regions)
    @JoinColumn({ name: 'id_country' })
    country: Country

    @OneToMany(() => City, (city) => city.region)
    cities: City[]
}
