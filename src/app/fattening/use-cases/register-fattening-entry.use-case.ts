import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterFatteningEntryDto } from '../dto/inputs/register-fattening-entry.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS } from 'src/app/breeding/constants/event-type-ids.constant';
import { PRODUCTIVE_STATUS_IDS } from 'src/app/breeding/constants/productive-status-ids.constant';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class RegisterFatteningEntryUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly fatteningEntriesService: FatteningEntriesService,
    ) {}

    async execute(dto: RegisterFatteningEntryDto): Promise<FatteningEntryDto> {
        const animal = await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        if (animal!.idProductiveStatus !== PRODUCTIVE_STATUS_IDS.RECRIA) {
            throw new MyBadRequestException(
                `El animal ID=${dto.idRanchAnimal} no está en Recría (ps=2). Estado actual: ps=${animal!.idProductiveStatus}.`,
                'ANIMAL_NOT_IN_REARING',
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.FATTENING_ENTRY,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            const entry = await this.fatteningEntriesService.create({
                idEvent: event.id,
                systemType: dto.systemType,
                initialWeight: dto.initialWeight,
            }, manager);

            await manager.getRepository(RanchAnimal).update(
                { id: dto.idRanchAnimal },
                { idProductiveStatus: PRODUCTIVE_STATUS_IDS.ENGORDE, idLot: dto.idLotDest, updatedAt: new Date() },
            );

            return (await this.fatteningEntriesService.findOneById(
                entry.id,
                { throwException: true, template: FatteningEntryDto },
                manager,
            ))!;
        });
    }
}
