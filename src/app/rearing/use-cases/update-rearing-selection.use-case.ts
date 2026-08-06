import { Injectable } from '@nestjs/common';
import { UpdateRearingSelectionDto } from '../dto/inputs/update-rearing-selection.dto';
import { RearingSelectionsService } from 'src/modules/rearing-modules/rearing-selections/services/rearing-selections.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateRearingSelectionUseCase {
    constructor(
        private readonly rearingSelectionsService: RearingSelectionsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateRearingSelectionDto, idUser: number): Promise<RearingSelectionDto> {
        const existing = await this.rearingSelectionsService.findOneById(RearingSelectionDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.rearingSelectionsService.update(id, dto);
        return (await this.rearingSelectionsService.findOneById(RearingSelectionDto, id, { throwException: true }))!;
    }
}
