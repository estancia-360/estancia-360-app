import { BaseEntityTurnable } from "src/infrastructure/database/utils";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Region } from "../../regions/entities/region.entity";

@Entity('countries')
export class Country extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_country' })
    id: number;

    @Column({
        name: 'id_region',
        type: 'int',
    })
    idRegion: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 100,
    })
    name: string;

    @OneToMany(() => Region, (region) => region.country)
    @JoinColumn({ name: 'id_region' })
    regions: Region[]
}
