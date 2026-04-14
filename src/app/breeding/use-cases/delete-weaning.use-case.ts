import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';

@Injectable()
export class DeleteWeaningUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly weaningsService: WeaningsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
    ) {}

    async execute(id: number): Promise<void> {
        const weaning = await this.weaningsService.findOneById(id, {
            throwException: true,
            template: WeaningDto,
        });
        const { idEvent, idCria } = weaning!;

        await this.dataSource.transaction(async (manager) => {
            await this.weaningsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(idEvent, manager);
            await this.ranchAnimalsService.markIsNotWeaned(idCria, manager);
            await manager.createQueryBuilder()
                .update(RanchAnimal)
                .set({ idLot: () => 'NULL' })
                .where({ id: idCria })
                .execute();
        });
    }
}
