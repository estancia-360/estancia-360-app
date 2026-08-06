import { Injectable } from '@nestjs/common';
import { UpdateVaccinationDto } from '../dto/inputs/update-vaccination.dto';
import { VaccinationsService } from 'src/modules/health-modules/vaccinations/services/vaccinations.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateVaccinationUseCase {
    constructor(
        private readonly vaccinationsService: VaccinationsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateVaccinationDto, idUser: number): Promise<VaccinationDto> {
        const existing = await this.vaccinationsService.findOneById(VaccinationDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.vaccinationsService.update(id, dto);
        return (await this.vaccinationsService.findOneById(VaccinationDto, id, { throwException: true }))!;
    }
}
