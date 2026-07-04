import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TreatmentsService } from 'src/modules/health-modules/treatments/services/treatments.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { TreatmentDto } from 'src/modules/health-modules/treatments/dto/treatment.dto';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteTreatmentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly treatmentsService: TreatmentsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number): Promise<void> {
        const treatment = await this.treatmentsService.findOneById(id, {
            throwException: true,
            template: TreatmentDto,
        });

        const idRanchAnimal = treatment!.event.idRanchAnimal;

        const animal = await this.ranchAnimalsService.findOneById(idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });
        const idRanch = animal!.idRanch;

        await this.dataSource.transaction(async (manager) => {
            await this.treatmentsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(treatment!.idEvent, manager);

            await this.syncDeletionsService.log('treatments', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', treatment!.idEvent, idRanch, manager);
        });
    }
}
