import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterVaccinationDto } from '../dto/inputs/register-vaccination.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { VaccinationsService } from 'src/modules/health-modules/vaccinations/services/vaccinations.service';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS, PRODUCTIVE_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class RegisterVaccinationUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly vaccinationsService: VaccinationsService,
    ) {}

    async execute(dto: RegisterVaccinationDto, idUser: number): Promise<VaccinationDto> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        // RN-02: a discharged animal cannot receive new events.
        if (animal.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new BadRequestException({
                message: `Animal ID=${dto.idRanchAnimal} is discharged (ps=4) and cannot receive vaccinations.`,
                error: 'ANIMAL_IS_BAJA',
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.VACCINATION,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const vaccination = await this.vaccinationsService.create(
                {
                    idEvent: event.id,
                    vaccineName: dto.vaccineName,
                    dose: dto.dose,
                    responsible: dto.responsible,
                    notes: dto.notes,
                    localId: dto.localId,
                },
                manager,
            );

            return (await this.vaccinationsService.findOneById(VaccinationDto, vaccination.id, { throwException: true }, manager))!;
        });
    }
}
