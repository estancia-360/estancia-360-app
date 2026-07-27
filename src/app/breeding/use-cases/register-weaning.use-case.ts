import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterWeaningDto } from '../dto/inputs/register-weaning.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchLotDto } from 'src/modules/ranch-management/ranch-lots/dto/ranch-lot.dto';
import { EVENT_TYPE_IDS } from 'src/shared/constants';
import { LotTypesEnum } from 'src/shared/enums';

@Injectable()
export class RegisterWeaningUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly weaningsService: WeaningsService,
    ) {}

    async execute(dto: RegisterWeaningDto, idUser?: number): Promise<WeaningDto> {
        await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);

        const lot = await this.ranchLotsService.findOneById(RanchLotDto, dto.idLotDest);
        if (lot.lotType !== LotTypesEnum.REARING) {
            throw new BadRequestException({
                message: 'The destination lot must be of type rearing (RN-15).',
                error: 'LOT_NOT_REARING_TYPE',
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.WEANING,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const weaning = await this.weaningsService.create(
                {
                    idEvent: event.id,
                    idCria: dto.idRanchAnimal,
                    idLotDest: dto.idLotDest,
                    weaningWeight: dto.weaningWeight,
                    weaningAge: dto.weaningAge,
                    localId: dto.localId,
                },
                manager,
            );

            await this.ranchAnimalsService.markIsWeaned(dto.idRanchAnimal, manager);
            await manager
                .createQueryBuilder()
                .update(RanchAnimal)
                .set({ idLot: dto.idLotDest, updatedAt: new Date() })
                .where({ id: dto.idRanchAnimal })
                .execute();

            return (await this.weaningsService.findOneById(WeaningDto, weaning.id, { throwException: true }, manager))!;
        });
    }
}
