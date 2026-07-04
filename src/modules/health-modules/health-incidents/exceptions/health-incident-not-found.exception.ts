import { MyNotFoundException } from 'src/shared/exceptions';

export class HealthIncidentNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El incidente sanitario con ID = ${id} no fue encontrado.`, 'HEALTH_INCIDENT_NOT_FOUND');
    }
}
