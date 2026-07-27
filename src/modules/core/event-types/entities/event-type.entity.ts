import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';

@Entity('event_types')
export class EventType extends BaseEntityTurnable {
    @PrimaryColumn({ name: 'id_event_type', type: 'int' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 50 })
    name: string;
}
