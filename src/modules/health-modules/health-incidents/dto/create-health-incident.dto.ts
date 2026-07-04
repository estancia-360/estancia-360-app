import { IncidentTypeEnum } from '../entities/health-incident.entity';

export class CreateHealthIncidentDto {
    idEvent: number;
    incidentType: IncidentTypeEnum;
    description?: string;
    resolvedAt?: Date;
    notes?: string;
}
