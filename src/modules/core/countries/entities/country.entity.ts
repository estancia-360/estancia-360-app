import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';

@Entity('countries')
export class Country extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_country' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;
}
