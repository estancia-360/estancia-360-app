import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteParturitionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly parturitionsService: ParturitionsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    /**
     * Elimina un parto y su AnimalEvent asociado.
     * No afecta en cascada a otros registros de cría.
     *
     * Orden de eliminación:
     *  1. Parturition
     *  2. AnimalEvent del parto
     */
    async execute(id: number): Promise<void> {
        const parturition = await this.parturitionsService.findOneById(id, {
            throwException: true,
            template: ParturitionDto,
        });
        const parturitionEventId = parturition!.idEvent;

        const animal = await this.ranchAnimalsService.findOneById(parturition!.event.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });
        const idRanch = animal!.idRanch;

        await this.dataSource.transaction(async (manager) => {
            await this.parturitionsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(parturitionEventId, manager);
            await this.syncDeletionsService.log('parturitions', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', parturitionEventId, idRanch, manager);
        });
    }
}
