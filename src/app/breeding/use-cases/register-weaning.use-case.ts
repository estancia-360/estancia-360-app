import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterWeaningDto } from '../dto/inputs/register-weaning.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS } from '../constants/event-type-ids.constant';
import { LotTypesEnum } from 'src/shared/enums';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class RegisterWeaningUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly weaningsService: WeaningsService,
    ) {}

    async execute(dto: RegisterWeaningDto): Promise<WeaningDto> {
        await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        const lot = await this.ranchLotsService.findOne(dto.idLotDest);
        if (lot.lotType !== LotTypesEnum.REARING) {
            throw new MyBadRequestException(
                'El lote de destino debe ser de tipo recría (RN-15)',
                'LOT_NOT_REARING_TYPE',
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.WEANING,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            const weaning = await this.weaningsService.create({
                idEvent: event.id,
                idCria: dto.idRanchAnimal,
                idLotDest: dto.idLotDest,
                weaningWeight: dto.weaningWeight,
                weaningAge: dto.weaningAge,
            }, manager);

            await this.ranchAnimalsService.markIsWeaned(dto.idRanchAnimal, manager);
            await manager.getRepository(RanchAnimal).update(
                { id: dto.idRanchAnimal },
                { idLot: dto.idLotDest },
            );

            return (await this.weaningsService.findOneById(
                weaning.id,
                { throwException: true, template: WeaningDto },
                manager,
            ))!;
        });
    }
}
