import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AnimalDeclaredHistoryService } from 'src/modules/breeding-modules/animal-declared-history/services/animal-declared-history.service';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteAnimalDeclaredHistoryUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number): Promise<void> {
        const history = await this.animalDeclaredHistoryService.findOneById(AnimalDeclaredHistoryDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, history.idRanchAnimal);
        const idRanch = animal.idRanch;

        await this.dataSource.transaction(async (manager) => {
            await this.animalDeclaredHistoryService.deleteById(id, manager);
            await this.syncDeletionsService.log('animal_declared_history', id, idRanch, manager);
        });
    }
}
