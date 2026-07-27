import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterBreedingServiceDto } from '../dto/inputs/register-breeding-service.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS } from 'src/shared/constants';
import { RanchAnimalNotFoundException } from 'src/modules/ranch-management/ranch-animals/exceptions';

@Injectable()
export class RegisterBreedingServiceUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly breedingServicesService: BreedingServicesService,
    ) {}

    async execute(dto: RegisterBreedingServiceDto, idUser?: number): Promise<BreedingServiceDto> {
        const female = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        if (female.sex !== 'F') throw new RanchAnimalNotFoundException(dto.idRanchAnimal);

        if (dto.idAnimalMale !== undefined && dto.idAnimalMale !== null) {
            const male = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idAnimalMale);
            if (male.sex !== 'M') throw new RanchAnimalNotFoundException(dto.idAnimalMale);
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.SERVICE,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const service = await this.breedingServicesService.create(
                {
                    idEvent: event.id,
                    idAnimalMale: dto.idAnimalMale,
                    serviceType: dto.serviceType,
                    semenBreed: dto.semenBreed,
                    technician: dto.technician,
                    reproductiveLot: dto.reproductiveLot,
                    localId: dto.localId,
                },
                manager,
            );

            return (await this.breedingServicesService.findOneById(
                BreedingServiceDto,
                service.id,
                { throwException: true },
                manager,
            ))!;
        });
    }
}
