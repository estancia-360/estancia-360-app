import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum IncidentTypeEnum {
    ILLNESS_DETECTED = 'illness_detected',
    QUARANTINE = 'quarantine',
}

@Entity('health_incidents')
export class HealthIncident extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_incident', type: 'bigint' })
    id: number;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'incident_type', type: 'varchar', length: 30, nullable: false })
    incidentType: IncidentTypeEnum;

    @Column({ name: 'description', type: 'varchar', length: 300, nullable: true })
    description?: string;

    @Column({ name: 'resolved_at', type: 'date', nullable: true })
    resolvedAt?: Date;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
