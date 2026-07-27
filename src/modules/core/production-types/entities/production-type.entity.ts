import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';

@Entity('production_types')
export class ProductionType extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_type' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 30 })
    name: string;
}
