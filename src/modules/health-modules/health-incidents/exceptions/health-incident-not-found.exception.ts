import { NotFoundException } from '@nestjs/common';

export class HealthIncidentNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Health incident ID=${id} not found.`, error: 'HEALTH_INCIDENT_NOT_FOUND' });
    }
}
