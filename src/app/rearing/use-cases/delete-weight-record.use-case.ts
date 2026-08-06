import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WeightRecordsService } from 'src/modules/rearing-modules/weight-records/services/weight-records.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteWeightRecordUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly weightRecordsService: WeightRecordsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    /** Reverts ranch_animals.weight to the immediately previous weighing (or null if none). */
    async execute(id: number, idUser: number): Promise<void> {
        const record = await this.weightRecordsService.findOneById(WeightRecordDto, id, { throwException: true });
        const idRanchAnimal = record.event.idRanchAnimal;
        const eventDate = new Date(record.event.eventDate);

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        const idRanch = animal.idRanch;
        await this.ranchUsersService.assertMember(idUser, idRanch);

        await this.dataSource.transaction(async (manager) => {
            await this.weightRecordsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(record.idEvent, manager);

            const previous = await this.weightRecordsService.findPreviousByAnimal(idRanchAnimal, eventDate, manager);

            if (previous) {
                await manager.getRepository(RanchAnimal).update({ id: idRanchAnimal }, { weight: previous.weight, updatedAt: new Date() });
            } else {
                await manager
                    .createQueryBuilder()
                    .update(RanchAnimal)
                    .set({ weight: () => 'NULL', updatedAt: () => 'CURRENT_TIMESTAMP' })
                    .where({ id: idRanchAnimal })
                    .execute();
            }

            await this.syncDeletionsService.log('weight_records', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', record.idEvent, idRanch, manager);
        });
    }
}
