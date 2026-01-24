import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Region } from "../../regions/entities/region.entity";
import { BaseEntityTurnable } from "src/infrastructure/database/utils";
import { Ranch } from "src/modules/ranch-management/ranches/entities/ranch.entity";

@Entity('cities')
export class City extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_city' })
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

    @ManyToOne(() => Region, (region) => region.cities)
    @JoinColumn({ name: 'id_region' })
    region: Region;

    @OneToMany(() => Ranch, (ranch) => ranch.city)
    ranches: Ranch[]
}
