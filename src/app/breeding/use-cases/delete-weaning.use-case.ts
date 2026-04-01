import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';

@Injectable()
export class DeleteWeaningUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly weaningsService: WeaningsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
    ) {}

    /**
     * Elimina un destete, su AnimalEvent asociado y revierte el marcado
     * isWeared del animal (lo pone en null).
     *
     * Orden de eliminación:
     *  1. Weaning
     *  2. AnimalEvent del destete
     *  3. Revertir isWeared = null en RanchAnimal
     */
    async execute(id: number): Promise<void> {
        const weaning = await this.weaningsService.findOneById(id, {
            throwException: true,
            template: WeaningDto,
        });
        const weaningEventId = weaning!.idEvent;
        const idRanchAnimal = weaning!.event?.idRanchAnimal;

        await this.dataSource.transaction(async (manager) => {
            await this.weaningsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(weaningEventId, manager);
            if (idRanchAnimal) {
                await this.ranchAnimalsService.markIsNotWeaned(idRanchAnimal, manager);
            }
        });
    }
}
