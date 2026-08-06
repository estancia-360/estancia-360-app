import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateHealthIncidentDto } from '../dto/inputs/update-health-incident.dto';
import { HealthIncidentsService } from 'src/modules/health-modules/health-incidents/services/health-incidents.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { IncidentTypeEnum } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { ANIMAL_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class UpdateHealthIncidentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly healthIncidentsService: HealthIncidentsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateHealthIncidentDto, idUser: number): Promise<HealthIncidentDto> {
        return await this.dataSource.transaction(async (manager) => {
            const existing = await this.healthIncidentsService.findOneById(HealthIncidentDto, id, { throwException: true }, manager);
            const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
            await this.ranchUsersService.assertMember(idUser, animal.idRanch);

            await this.healthIncidentsService.update(id, { description: dto.description, resolvedAt: dto.resolvedAt, notes: dto.notes }, manager);

            // Resolving an active quarantine reverts the animal to id_status=1 (Activo).
            const wasUnresolved = !existing.resolvedAt;
            if (existing.incidentType === IncidentTypeEnum.QUARANTINE && wasUnresolved && dto.resolvedAt) {
                await manager
                    .getRepository(RanchAnimal)
                    .update({ id: existing.event.idRanchAnimal }, { idStatus: ANIMAL_STATUS_IDS.ACTIVE, updatedAt: new Date() });
            }

            return (await this.healthIncidentsService.findOneById(HealthIncidentDto, id, { throwException: true }, manager))!;
        });
    }
}
