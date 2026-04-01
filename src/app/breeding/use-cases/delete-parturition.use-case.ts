import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';

@Injectable()
export class DeleteParturitionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly parturitionsService: ParturitionsService,
        private readonly animalEventsService: AnimalEventsService,
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

        await this.dataSource.transaction(async (manager) => {
            await this.parturitionsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(parturitionEventId, manager);
        });
    }
}
