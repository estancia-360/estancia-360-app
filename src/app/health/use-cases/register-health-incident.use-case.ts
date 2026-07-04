import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterHealthIncidentDto } from '../dto/inputs/register-health-incident.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { HealthIncidentsService } from 'src/modules/health-modules/health-incidents/services/health-incidents.service';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';
import { IncidentTypeEnum } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS } from 'src/app/breeding/constants/event-type-ids.constant';
import { PRODUCTIVE_STATUS_IDS } from 'src/app/breeding/constants/productive-status-ids.constant';
import { ANIMAL_STATUS_IDS } from 'src/app/breeding/constants/animal-status-ids.constant';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class RegisterHealthIncidentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly healthIncidentsService: HealthIncidentsService,
    ) {}

    async execute(dto: RegisterHealthIncidentDto): Promise<HealthIncidentDto> {
        const animal = await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        // RN-02: animal dado de baja no puede recibir eventos
        if (animal!.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new MyBadRequestException(
                `El animal ID=${dto.idRanchAnimal} está dado de baja (ps=4) y no puede recibir incidentes sanitarios.`,
                'ANIMAL_IS_BAJA',
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.HEALTH_INCIDENT,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            const incident = await this.healthIncidentsService.create({
                idEvent: event.id,
                incidentType: dto.incidentType,
                description: dto.description,
                notes: dto.notes,
            }, manager);

            // Cuarentena: el animal pasa a id_status=2 (En Observación)
            if (dto.incidentType === IncidentTypeEnum.QUARANTINE) {
                await manager.getRepository(RanchAnimal).update(
                    { id: dto.idRanchAnimal },
                    { idStatus: ANIMAL_STATUS_IDS.OBSERVACION, updatedAt: new Date() },
                );
            }

            return (await this.healthIncidentsService.findOneById(
                incident.id,
                { throwException: true, template: HealthIncidentDto },
                manager,
            ))!;
        });
    }
}
