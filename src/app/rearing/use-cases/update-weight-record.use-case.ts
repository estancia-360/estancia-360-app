import { Injectable } from '@nestjs/common';
import { UpdateWeightRecordDto } from '../dto/inputs/update-weight-record.dto';
import { WeightRecordsService } from 'src/modules/rearing-modules/weight-records/services/weight-records.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class UpdateWeightRecordUseCase {
    constructor(
        private readonly weightRecordsService: WeightRecordsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateWeightRecordDto, idUser: number): Promise<WeightRecordDto> {
        const existing = await this.weightRecordsService.findOneById(WeightRecordDto, id, { throwException: true });
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        await this.weightRecordsService.update(id, dto);
        return (await this.weightRecordsService.findOneById(WeightRecordDto, id, { throwException: true }))!;
    }
}
