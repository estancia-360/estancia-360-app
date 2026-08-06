import { Injectable } from '@nestjs/common';
import { UpdateGestationDiagnosisDto } from '../dto/inputs/update-gestation-diagnosis.dto';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateGestationDiagnosisUseCase {
    constructor(
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateGestationDiagnosisDto, idUser: number): Promise<GestationDiagnosisDto> {
        const existing = await this.gestationDiagnosesService.findOneById(GestationDiagnosisDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.gestationDiagnosesService.update(id, dto);
        return (await this.gestationDiagnosesService.findOneById(GestationDiagnosisDto, id, { throwException: true }))!;
    }
}
