import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterRearingSelectionDto } from '../dto/inputs/register-rearing-selection.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RearingSelectionsService } from 'src/modules/rearing-modules/rearing-selections/services/rearing-selections.service';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS, PRODUCTIVE_STATUS_IDS, ANIMAL_STATUS_IDS, PRODUCTION_TYPE_IDS } from 'src/shared/constants';
import { RearingDestinationEnum } from 'src/modules/rearing-modules/rearing-selections/entities/rearing-selection.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchesService } from 'src/modules/ranch-management/ranches/services/ranches.service';

@Injectable()
export class RegisterRearingSelectionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly rearingSelectionsService: RearingSelectionsService,
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly ranchesService: RanchesService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    /**
     * - replacement: stays in Recría (ps=2)
     * - fattening: moves to Engorde (ps=3), creates a fattening_entry in the same tx
     * - sale: moves to Baja (ps=4, status=3) — does not create a movement record yet
     */
    async execute(dto: RegisterRearingSelectionDto, idUser: number): Promise<RearingSelectionDto> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        if (animal.idProductiveStatus !== PRODUCTIVE_STATUS_IDS.RECRIA) {
            throw new BadRequestException({
                message: `Animal ID=${dto.idRanchAnimal} is not in Recría (ps=2). Current status: ps=${animal.idProductiveStatus}.`,
                error: 'ANIMAL_NOT_IN_REARING',
            });
        }

        const hasRecria = await this.ranchesService.hasProductionTypeEnabled(animal.idRanch, PRODUCTION_TYPE_IDS.RECRIA);
        if (!hasRecria) {
            throw new BadRequestException({
                message: `Ranch ID=${animal.idRanch} does not have Recría enabled as a rubro.`,
                error: 'RANCH_PRODUCTION_TYPE_NOT_ENABLED',
            });
        }

        // RN-09: Engorde solo desde Recría Y estancia con Engorde habilitado.
        if (dto.destination === RearingDestinationEnum.FATTENING) {
            const hasEngorde = await this.ranchesService.hasProductionTypeEnabled(animal.idRanch, PRODUCTION_TYPE_IDS.ENGORDE);
            if (!hasEngorde) {
                throw new BadRequestException({
                    message: `Ranch ID=${animal.idRanch} does not have Engorde enabled as a rubro.`,
                    error: 'RANCH_PRODUCTION_TYPE_NOT_ENABLED',
                });
            }
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.REARING_SELECTION,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const selection = await this.rearingSelectionsService.create(
                {
                    idEvent: event.id,
                    localId: dto.localId,
                    idLotDest: dto.idLotDest,
                    destination: dto.destination,
                    weightAtSelection: dto.weightAtSelection,
                    bodyCondition: dto.bodyCondition,
                    geneticScore: dto.geneticScore,
                    ageDays: dto.ageDays,
                },
                manager,
            );

            if (dto.destination === RearingDestinationEnum.FATTENING) {
                const fatteningEvent = await this.animalEventsService.create(
                    {
                        idRanchAnimal: dto.idRanchAnimal,
                        idEventType: EVENT_TYPE_IDS.FATTENING_ENTRY,
                        idUser,
                        isSynced: dto.isSynced ?? false,
                        eventDate: new Date(dto.eventDate),
                    },
                    manager,
                );

                await this.fatteningEntriesService.create(
                    { idEvent: fatteningEvent.id, initialWeight: dto.weightAtSelection, systemType: dto.systemType! },
                    manager,
                );

                const animalUpdates: Partial<RanchAnimal> = { idProductiveStatus: PRODUCTIVE_STATUS_IDS.ENGORDE, updatedAt: new Date() };
                if (dto.idLotDest) animalUpdates.idLot = dto.idLotDest;
                await manager.getRepository(RanchAnimal).update({ id: dto.idRanchAnimal }, animalUpdates);
            } else if (dto.destination === RearingDestinationEnum.SALE) {
                await manager
                    .getRepository(RanchAnimal)
                    .update(
                        { id: dto.idRanchAnimal },
                        { idProductiveStatus: PRODUCTIVE_STATUS_IDS.BAJA, idStatus: ANIMAL_STATUS_IDS.INACTIVE, updatedAt: new Date() },
                    );
            }

            return (await this.rearingSelectionsService.findOneById(RearingSelectionDto, selection.id, { throwException: true }, manager))!;
        });
    }
}
