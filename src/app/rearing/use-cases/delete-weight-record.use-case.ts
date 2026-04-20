import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WeightRecordsService } from 'src/modules/rearing-modules/weight-records/services/weight-records.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

@Injectable()
export class DeleteWeightRecordUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly weightRecordsService: WeightRecordsService,
        private readonly animalEventsService: AnimalEventsService,
    ) {}

    async execute(id: number): Promise<void> {
        const record = await this.weightRecordsService.findOneById(id, {
            throwException: true,
            template: WeightRecordDto,
        });

        const idRanchAnimal = record!.event.idRanchAnimal;
        const eventDate = new Date(record!.event.eventDate);

        await this.dataSource.transaction(async (manager) => {
            await this.weightRecordsService.deleteById(id, manager);
            await this.animalEventsService.deleteById(record!.idEvent, manager);

            const previous = await this.weightRecordsService.findPreviousByAnimal(
                idRanchAnimal,
                eventDate,
                manager,
            );

            if (previous) {
                await manager.getRepository(RanchAnimal).update(
                    { id: idRanchAnimal },
                    { weight: previous.weight },
                );
            } else {
                await manager.createQueryBuilder()
                    .update(RanchAnimal)
                    .set({ weight: () => 'NULL' })
                    .where({ id: idRanchAnimal })
                    .execute();
            }
        });
    }
}
