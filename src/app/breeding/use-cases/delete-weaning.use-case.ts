import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteWeaningUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly weaningsService: WeaningsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number, idUser: number): Promise<void> {
        const weaning = await this.weaningsService.findOneById(WeaningDto, id, { throwException: true });
        const { idEvent, idCria } = weaning;

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idCria);
        const idRanch = animal.idRanch;
        await this.ranchUsersService.assertMember(idUser, idRanch);

        await this.dataSource.transaction(async (manager) => {
            await this.weaningsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(idEvent, manager);
            await this.ranchAnimalsService.markIsNotWeaned(idCria, manager);
            await manager
                .createQueryBuilder()
                .update(RanchAnimal)
                .set({ idLot: () => 'NULL', updatedAt: () => 'CURRENT_TIMESTAMP' })
                .where({ id: idCria })
                .execute();
            await this.syncDeletionsService.log('weanings', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', idEvent, idRanch, manager);
        });
    }
}
