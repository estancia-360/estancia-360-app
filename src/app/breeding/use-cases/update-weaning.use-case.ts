import { Injectable } from '@nestjs/common';
import { UpdateWeaningDto } from '../dto/inputs/update-weaning.dto';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateWeaningUseCase {
    constructor(
        private readonly weaningsService: WeaningsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateWeaningDto, idUser: number): Promise<WeaningDto> {
        const existing = await this.weaningsService.findOneById(WeaningDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        // dto.ageDays → weaningAge: el viejo tenía este mismatch de nombres y el
        // valor nunca se aplicaba. Se corrige acá sin cambiar el campo que espera
        // el cliente (sigue siendo "ageDays" en el body).
        await this.weaningsService.update(id, { weaningWeight: dto.weaningWeight, weaningAge: dto.ageDays });
        return (await this.weaningsService.findOneById(WeaningDto, id, { throwException: true }))!;
    }
}
