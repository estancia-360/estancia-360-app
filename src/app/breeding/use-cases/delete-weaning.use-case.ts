import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';

@Injectable()
export class DeleteWeaningUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly weaningsService: WeaningsService,
        private readonly animalEventsService: AnimalEventsService,
    ) {}

    async execute(id: number): Promise<void> {
        const weaning = await this.weaningsService.findOneById(id, {
            throwException: true,
            template: WeaningDto,
        });
        const weaningEventId = weaning!.idEvent;

        await this.dataSource.transaction(async (manager) => {
            await this.weaningsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(weaningEventId, manager);
        });
    }
}
