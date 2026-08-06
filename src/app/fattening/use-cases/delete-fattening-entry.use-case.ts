import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { PRODUCTIVE_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class DeleteFatteningEntryUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number, idUser: number): Promise<void> {
        const entry = await this.fatteningEntriesService.findOneById(FatteningEntryDto, id, { throwException: true });
        const idRanchAnimal = entry.event.idRanchAnimal;

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        const idRanch = animal.idRanch;
        await this.ranchUsersService.assertMember(idUser, idRanch);

        await this.dataSource.transaction(async (manager) => {
            await this.fatteningEntriesService.deleteById(id, manager);
            await this.animalEventsService.deleteById(entry.idEvent, manager);

            await manager
                .createQueryBuilder()
                .update(RanchAnimal)
                .set({ idProductiveStatus: PRODUCTIVE_STATUS_IDS.RECRIA, idLot: () => 'NULL', updatedAt: () => 'CURRENT_TIMESTAMP' })
                .where({ id: idRanchAnimal })
                .execute();

            await this.syncDeletionsService.log('fattening_entries', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', entry.idEvent, idRanch, manager);
        });
    }
}
