import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterHealthIncidentDto } from '../dto/inputs/register-health-incident.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { HealthIncidentsService } from 'src/modules/health-modules/health-incidents/services/health-incidents.service';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';
import { IncidentTypeEnum } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS, PRODUCTIVE_STATUS_IDS, ANIMAL_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class RegisterHealthIncidentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly healthIncidentsService: HealthIncidentsService,
    ) {}

    async execute(dto: RegisterHealthIncidentDto, idUser: number): Promise<HealthIncidentDto> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        if (animal.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new BadRequestException({
                message: `Animal ID=${dto.idRanchAnimal} is discharged (ps=4) and cannot receive health incidents.`,
                error: 'ANIMAL_IS_BAJA',
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.HEALTH_INCIDENT,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const incident = await this.healthIncidentsService.create(
                { idEvent: event.id, incidentType: dto.incidentType, description: dto.description, notes: dto.notes, localId: dto.localId },
                manager,
            );

            // Quarantine: the animal moves to id_status=2 (En Observación).
            if (dto.incidentType === IncidentTypeEnum.QUARANTINE) {
                await manager
                    .getRepository(RanchAnimal)
                    .update({ id: dto.idRanchAnimal }, { idStatus: ANIMAL_STATUS_IDS.OBSERVATION, updatedAt: new Date() });
            }

            return (await this.healthIncidentsService.findOneById(HealthIncidentDto, incident.id, { throwException: true }, manager))!;
        });
    }
}
