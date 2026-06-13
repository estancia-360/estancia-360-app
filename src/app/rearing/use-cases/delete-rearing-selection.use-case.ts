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

const PRODUCTIVE_STATUS_IDS = { RECRIA: 2 };

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
     * Elimina una selección de recría y revierte el estado del animal.
     * - Si la selección era de engorde, elimina también el fattening_entry.
     * - El animal vuelve a ps=2 (Recría).
     * - Si era sale (ps=4), NO se revierte (baja es irreversible — RN-07).
     */
    async execute(id: number): Promise<void> {
        const selection = await this.rearingSelectionsService.findOneById(id, {
            throwException: true,
            template: RearingSelectionDto,
        });

        const animal = await this.ranchAnimalsService.findOneById(selection!.event.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });
        const idRanch = animal!.idRanch;

        await this.dataSource.transaction(async (manager) => {
            if (selection!.destination === RearingDestinationEnum.FATTENING) {
                const fatteningEntry = await this.fatteningEntriesService.findOneByEventId(selection!.idEvent, manager);
                if (fatteningEntry) {
                    await this.fatteningEntriesService.deleteById(fatteningEntry.id, manager);
                    await this.animalEventsService.deleteById(fatteningEntry.idEvent, manager);
                    await this.syncDeletionsService.log('fattening_entries', fatteningEntry.id, idRanch, manager);
                    await this.syncDeletionsService.log('animal_events', fatteningEntry.idEvent, idRanch, manager);
                }
                await manager.createQueryBuilder()
                    .update(RanchAnimal)
                    .set({ idProductiveStatus: PRODUCTIVE_STATUS_IDS.RECRIA, idLot: () => 'NULL', updatedAt: () => 'CURRENT_TIMESTAMP' })
                    .where({ id: selection!.event.idRanchAnimal })
                    .execute();
            }

            await this.rearingSelectionsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(selection!.idEvent, manager);
            await this.syncDeletionsService.log('rearing_selections', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', selection!.idEvent, idRanch, manager);
        });
    }
}
