import { Injectable } from '@nestjs/common';
import { UpdateAnimalDeclaredHistoryDto } from '../dto/inputs/update-animal-declared-history.dto';
import { AnimalDeclaredHistoryService } from 'src/modules/breeding-modules/animal-declared-history/services/animal-declared-history.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateAnimalDeclaredHistoryUseCase {
    constructor(
        private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateAnimalDeclaredHistoryDto, idUser: number): Promise<AnimalDeclaredHistoryDto> {
        const existing = await this.animalDeclaredHistoryService.findOneById(AnimalDeclaredHistoryDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.animalDeclaredHistoryService.update(id, dto);
        return (await this.animalDeclaredHistoryService.findOneById(AnimalDeclaredHistoryDto, id, { throwException: true }))!;
    }
}
