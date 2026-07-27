import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';

@Entity('productive_statuses')
export class ProductiveStatus extends BaseEntityTurnable {
    @PrimaryColumn({ name: 'id_productive_status', type: 'int' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 50 })
    name: string;
}
