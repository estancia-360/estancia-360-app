import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterRearingSelectionDto } from '../dto/inputs/register-rearing-selection.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RearingSelectionsService } from 'src/modules/rearing-modules/rearing-selections/services/rearing-selections.service';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS } from 'src/app/breeding/constants/event-type-ids.constant';
import { RearingDestinationEnum } from 'src/modules/rearing-modules/rearing-selections/entities/rearing-selection.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { MyBadRequestException } from 'src/shared/exceptions';

const PRODUCTIVE_STATUS_IDS = { RECRIA: 2, ENGORDE: 3, BAJA: 4 };

@Injectable()
export class RegisterRearingSelectionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly rearingSelectionsService: RearingSelectionsService,
        private readonly fatteningEntriesService: FatteningEntriesService,
    ) {}

    /**
     * Registra la selección de recría de un animal.
     * - replacement: permanece en Recría (ps=2)
     * - fattening: pasa a Engorde (ps=3), se crea fattening_entry en la misma tx
     * - sale: pasa a Baja (ps=4, status=3), no crea animal_sale (módulo pendiente)
     */
    async execute(dto: RegisterRearingSelectionDto): Promise<RearingSelectionDto> {
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
                idEventType: EVENT_TYPE_IDS.REARING_SELECTION,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            const selection = await this.rearingSelectionsService.create({
                idEvent: event.id,
                localId: dto.localId,
                idLotDest: dto.idLotDest,
                destination: dto.destination,
                weightAtSelection: dto.weightAtSelection,
                bodyCondition: dto.bodyCondition,
                geneticScore: dto.geneticScore,
            }, manager);

            if (dto.destination === RearingDestinationEnum.FATTENING) {
                const fatteningEvent = await this.animalEventsService.create({
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.FATTENING_ENTRY,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                }, manager);

                await this.fatteningEntriesService.create({
                    idEvent: fatteningEvent.id,
                    initialWeight: dto.weightAtSelection,
                    systemType: dto.systemType!,
                }, manager);

                const animalUpdates: Partial<RanchAnimal> = { idProductiveStatus: PRODUCTIVE_STATUS_IDS.ENGORDE };
                if (dto.idLotDest) animalUpdates.idLot = dto.idLotDest;
                await manager.getRepository(RanchAnimal).update({ id: dto.idRanchAnimal }, animalUpdates);

            } else if (dto.destination === RearingDestinationEnum.SALE) {
                await manager.getRepository(RanchAnimal).update(
                    { id: dto.idRanchAnimal },
                    { idProductiveStatus: PRODUCTIVE_STATUS_IDS.BAJA, idStatus: 3 },
                );
            }

            return (await this.rearingSelectionsService.findOneById(
                selection.id,
                { throwException: true, template: RearingSelectionDto },
                manager,
            ))!;
        });
    }
}
