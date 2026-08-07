import { Injectable } from '@nestjs/common';
import { BulkImportAnimalsDto } from '../dto/inputs/bulk-import-animals.dto';
import { BulkImportResultDto } from '../dto/outputs/bulk-import-result.dto';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RanchAnimalDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal.dto';
import { runBulkRows } from '../utils/run-bulk-rows.util';

@Injectable()
export class BulkImportAnimalsUseCase {
    constructor(
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(dto: BulkImportAnimalsDto, idUser: number): Promise<BulkImportResultDto> {
        await this.ranchUsersService.assertMember(idUser, dto.idRanch);

        return await runBulkRows(dto.rows, async (row) => {
            const animal = await this.ranchAnimalsService.create({ ...row, idRanch: dto.idRanch }, RanchAnimalDto);
            return animal.id;
        });
    }
}
