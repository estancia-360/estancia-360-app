import { Injectable } from '@nestjs/common';
import { UpdateBreedingServiceDto } from '../dto/inputs/update-breeding-service.dto';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateBreedingServiceUseCase {
    constructor(
        private readonly breedingServicesService: BreedingServicesService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateBreedingServiceDto, idUser: number): Promise<BreedingServiceDto> {
        const existing = await this.breedingServicesService.findOneById(BreedingServiceDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.breedingServicesService.update(id, dto);
        return (await this.breedingServicesService.findOneById(BreedingServiceDto, id, { throwException: true }))!;
    }
}
