import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterVaccinationDto } from '../dto/inputs/register-vaccination.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { VaccinationsService } from 'src/modules/health-modules/vaccinations/services/vaccinations.service';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS } from 'src/app/breeding/constants/event-type-ids.constant';
import { PRODUCTIVE_STATUS_IDS } from 'src/app/breeding/constants/productive-status-ids.constant';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class RegisterVaccinationUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly vaccinationsService: VaccinationsService,
    ) {}

    async execute(dto: RegisterVaccinationDto): Promise<VaccinationDto> {
        const animal = await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        // RN-02: animal dado de baja no puede recibir eventos
        if (animal!.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new MyBadRequestException(
                `El animal ID=${dto.idRanchAnimal} está dado de baja (ps=4) y no puede recibir vacunaciones.`,
                'ANIMAL_IS_BAJA',
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.VACCINATION,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            const vaccination = await this.vaccinationsService.create({
                idEvent: event.id,
                vaccineName: dto.vaccineName,
                dose: dto.dose,
                responsible: dto.responsible,
                notes: dto.notes,
            }, manager);

            return (await this.vaccinationsService.findOneById(
                vaccination.id,
                { throwException: true, template: VaccinationDto },
                manager,
            ))!;
        });
    }
}
