import { Injectable } from '@nestjs/common';
import { UpdateFatteningEntryDto } from '../dto/inputs/update-fattening-entry.dto';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateFatteningEntryUseCase {
    constructor(
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateFatteningEntryDto, idUser: number): Promise<FatteningEntryDto> {
        const existing = await this.fatteningEntriesService.findOneById(FatteningEntryDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.fatteningEntriesService.update(id, dto);
        return (await this.fatteningEntriesService.findOneById(FatteningEntryDto, id, { throwException: true }))!;
    }
}
