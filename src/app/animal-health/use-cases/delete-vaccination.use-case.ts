import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VaccinationsService } from 'src/modules/health-modules/vaccinations/services/vaccinations.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteVaccinationUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly vaccinationsService: VaccinationsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number, idUser: number): Promise<void> {
        const vaccination = await this.vaccinationsService.findOneById(VaccinationDto, id, { throwException: true });
        const idRanchAnimal = vaccination.event.idRanchAnimal;

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        const idRanch = animal.idRanch;
        await this.ranchUsersService.assertMember(idUser, idRanch);

        await this.dataSource.transaction(async (manager) => {
            await this.vaccinationsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(vaccination.idEvent, manager);
            await this.syncDeletionsService.log('vaccinations', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', vaccination.idEvent, idRanch, manager);
        });
    }
}
