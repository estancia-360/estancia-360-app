import { Injectable } from '@nestjs/common';
import { UpdateParturitionDto } from '../dto/inputs/update-parturition.dto';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateParturitionUseCase {
    constructor(
        private readonly parturitionsService: ParturitionsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateParturitionDto, idUser: number): Promise<ParturitionDto> {
        const existing = await this.parturitionsService.findOneById(ParturitionDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.parturitionsService.update(id, dto);
        return (await this.parturitionsService.findOneById(ParturitionDto, id, { throwException: true }))!;
    }
}
