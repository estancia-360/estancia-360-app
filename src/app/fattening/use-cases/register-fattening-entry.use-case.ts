import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterFatteningEntryDto } from '../dto/inputs/register-fattening-entry.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchesService } from 'src/modules/ranch-management/ranches/services/ranches.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { EVENT_TYPE_IDS, PRODUCTIVE_STATUS_IDS, PRODUCTION_TYPE_IDS } from 'src/shared/constants';

@Injectable()
export class RegisterFatteningEntryUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly ranchesService: RanchesService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(dto: RegisterFatteningEntryDto, idUser: number): Promise<FatteningEntryDto> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        if (animal.idProductiveStatus !== PRODUCTIVE_STATUS_IDS.RECRIA) {
            throw new BadRequestException({
                message: `Animal ID=${dto.idRanchAnimal} is not in Recría (ps=2). Current status: ps=${animal.idProductiveStatus}.`,
                error: 'ANIMAL_NOT_IN_REARING',
            });
        }

        // RN-09: Engorde solo desde Recría Y estancia con Engorde habilitado.
        const hasEngorde = await this.ranchesService.hasProductionTypeEnabled(animal.idRanch, PRODUCTION_TYPE_IDS.ENGORDE);
        if (!hasEngorde) {
            throw new BadRequestException({
                message: `Ranch ID=${animal.idRanch} does not have Engorde enabled as a rubro.`,
                error: 'RANCH_PRODUCTION_TYPE_NOT_ENABLED',
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.FATTENING_ENTRY,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const entry = await this.fatteningEntriesService.create(
                { idEvent: event.id, systemType: dto.systemType, initialWeight: dto.initialWeight, localId: dto.localId },
                manager,
            );

            await manager
                .getRepository(RanchAnimal)
                .update({ id: dto.idRanchAnimal }, { idProductiveStatus: PRODUCTIVE_STATUS_IDS.ENGORDE, idLot: dto.idLotDest, updatedAt: new Date() });

            return (await this.fatteningEntriesService.findOneById(FatteningEntryDto, entry.id, { throwException: true }, manager))!;
        });
    }
}
