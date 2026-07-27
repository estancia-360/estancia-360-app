import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';
import { Country } from 'src/modules/core/countries/entities/country.entity';

@Entity('regions')
export class Region extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_region' })
    id: number;

    @Column({ name: 'id_country', type: 'int' })
    idCountry: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @ManyToOne(() => Country)
    @JoinColumn({ name: 'id_country' })
    country: Country;
}
