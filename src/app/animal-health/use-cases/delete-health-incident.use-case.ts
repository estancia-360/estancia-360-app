import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthIncidentsService } from 'src/modules/health-modules/health-incidents/services/health-incidents.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';
import { IncidentTypeEnum } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { ANIMAL_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class DeleteHealthIncidentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly healthIncidentsService: HealthIncidentsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number): Promise<void> {
        const incident = await this.healthIncidentsService.findOneById(HealthIncidentDto, id, { throwException: true });
        const idRanchAnimal = incident.event.idRanchAnimal;

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        const idRanch = animal.idRanch;

        await this.dataSource.transaction(async (manager) => {
            await this.healthIncidentsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(incident.idEvent, manager);

            // If it was still an active (unresolved) quarantine, revert the animal to Activo.
            if (incident.incidentType === IncidentTypeEnum.QUARANTINE && !incident.resolvedAt) {
                await manager.getRepository(RanchAnimal).update({ id: idRanchAnimal }, { idStatus: ANIMAL_STATUS_IDS.ACTIVE, updatedAt: new Date() });
            }

            await this.syncDeletionsService.log('health_incidents', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', incident.idEvent, idRanch, manager);
        });
    }
}
