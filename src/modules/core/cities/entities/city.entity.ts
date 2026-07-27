import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';
import { Region } from 'src/modules/core/regions/entities/region.entity';

@Entity('cities')
export class City extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_city' })
    id: number;

    @Column({ name: 'id_region', type: 'int' })
    idRegion: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @ManyToOne(() => Region)
    @JoinColumn({ name: 'id_region' })
    region: Region;
}
