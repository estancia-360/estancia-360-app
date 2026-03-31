import { BaseEntityTurnable } from "src/infrastructure/database/utils";
import { AnimalEvent } from "src/modules/ranch-management/animal-events/entities/animal-event.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity('event_types')
export class EventType extends BaseEntityTurnable {
    @PrimaryColumn({
        name: 'id_event_type',
        type: 'int',
    })
    id: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 50,
    })
    name: string;

    @OneToMany(() => AnimalEvent,(ae) => ae.eventType)
    events?: AnimalEvent[]
}
