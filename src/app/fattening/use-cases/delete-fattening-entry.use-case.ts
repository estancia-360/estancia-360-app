import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { PRODUCTIVE_STATUS_IDS } from 'src/app/breeding/constants/productive-status-ids.constant';

@Injectable()
export class DeleteFatteningEntryUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly animalEventsService: AnimalEventsService,
    ) {}

    async execute(id: number): Promise<void> {
        const entry = await this.fatteningEntriesService.findOneById(id, {
            throwException: true,
            template: FatteningEntryDto,
        });

        const idRanchAnimal = entry!.event.idRanchAnimal;

        await this.dataSource.transaction(async (manager) => {
            await this.fatteningEntriesService.deleteById(id, manager);
            await this.animalEventsService.deleteById(entry!.idEvent, manager);

            await manager.createQueryBuilder()
                .update(RanchAnimal)
                .set({ idProductiveStatus: PRODUCTIVE_STATUS_IDS.RECRIA, idLot: () => 'NULL' })
                .where({ id: idRanchAnimal })
                .execute();
        });
    }
}
