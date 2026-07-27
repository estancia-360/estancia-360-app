import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RearingSelectionsService } from 'src/modules/rearing-modules/rearing-selections/services/rearing-selections.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RearingDestinationEnum } from 'src/modules/rearing-modules/rearing-selections/entities/rearing-selection.entity';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { PRODUCTIVE_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class DeleteRearingSelectionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly rearingSelectionsService: RearingSelectionsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    /**
     * Deletes a rearing selection and reverts the animal's state.
     * - If the selection was for fattening, also deletes the fattening_entry it created.
     * - The animal goes back to ps=2 (Recría).
     * - If it was a sale (ps=4), it is NOT reverted (discharge is irreversible — RN-07).
     */
    async execute(id: number): Promise<void> {
        const selection = await this.rearingSelectionsService.findOneById(RearingSelectionDto, id, { throwException: true });
        const idRanchAnimal = selection.event.idRanchAnimal;

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        const idRanch = animal.idRanch;

        await this.dataSource.transaction(async (manager) => {
            if (selection.destination === RearingDestinationEnum.FATTENING) {
                // No hay FK directo entre rearing_selections y fattening_entries — se
                // buscan por animal (mismo criterio que register: el más reciente).
                const fatteningEntry = await this.fatteningEntriesService.findMostRecentByAnimal(idRanchAnimal, manager);
                if (fatteningEntry) {
                    await this.fatteningEntriesService.deleteById(fatteningEntry.id, manager);
                    await this.animalEventsService.deleteById(fatteningEntry.idEvent, manager);
                    await this.syncDeletionsService.log('fattening_entries', fatteningEntry.id, idRanch, manager);
                    await this.syncDeletionsService.log('animal_events', fatteningEntry.idEvent, idRanch, manager);
                }
                await manager
                    .createQueryBuilder()
                    .update(RanchAnimal)
                    .set({ idProductiveStatus: PRODUCTIVE_STATUS_IDS.RECRIA, idLot: () => 'NULL', updatedAt: () => 'CURRENT_TIMESTAMP' })
                    .where({ id: idRanchAnimal })
                    .execute();
            }

            await this.rearingSelectionsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(selection.idEvent, manager);
            await this.syncDeletionsService.log('rearing_selections', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', selection.idEvent, idRanch, manager);
        });
    }
}
