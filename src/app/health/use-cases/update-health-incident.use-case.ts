import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateHealthIncidentDto } from '../dto/inputs/update-health-incident.dto';
import { HealthIncidentsService } from 'src/modules/health-modules/health-incidents/services/health-incidents.service';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';
import { IncidentTypeEnum } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { ANIMAL_STATUS_IDS } from 'src/app/breeding/constants/animal-status-ids.constant';

@Injectable()
export class UpdateHealthIncidentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly healthIncidentsService: HealthIncidentsService,
    ) {}

    async execute(id: number, dto: UpdateHealthIncidentDto): Promise<HealthIncidentDto> {
        return await this.dataSource.transaction(async (manager) => {
            const existing = await this.healthIncidentsService.findOneById(id, {
                throwException: true,
                template: HealthIncidentDto,
            }, manager);

            await this.healthIncidentsService.update(id, {
                description: dto.description,
                resolvedAt: dto.resolvedAt,
                notes: dto.notes,
            }, manager);

            // Si se resuelve una cuarentena activa, el animal vuelve a id_status=1 (Activo)
            const wasUnresolved = !existing!.resolvedAt;
            if (existing!.incidentType === IncidentTypeEnum.QUARANTINE && wasUnresolved && dto.resolvedAt) {
                await manager.getRepository(RanchAnimal).update(
                    { id: existing!.event.idRanchAnimal },
                    { idStatus: ANIMAL_STATUS_IDS.ACTIVO, updatedAt: new Date() },
                );
            }

            return (await this.healthIncidentsService.findOneById(
                id,
                { throwException: true, template: HealthIncidentDto },
                manager,
            ))!;
        });
    }
}
