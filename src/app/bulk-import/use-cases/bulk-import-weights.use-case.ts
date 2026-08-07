import { Injectable } from '@nestjs/common';
import { BulkImportWeightsDto } from '../dto/inputs/bulk-import-weights.dto';
import { BulkImportResultDto } from '../dto/outputs/bulk-import-result.dto';
import { RegisterWeightRecordUseCase } from 'src/app/rearing/use-cases/register-weight-record.use-case';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { runBulkRows } from '../utils/run-bulk-rows.util';

@Injectable()
export class BulkImportWeightsUseCase {
    constructor(
        private readonly registerWeightRecordUseCase: RegisterWeightRecordUseCase,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(dto: BulkImportWeightsDto, idUser: number): Promise<BulkImportResultDto> {
        await this.ranchUsersService.assertMember(idUser, dto.idRanch);

        return await runBulkRows(dto.rows, async (row) => {
            const record = await this.registerWeightRecordUseCase.execute({ ...row, isSynced: false }, idUser);
            return record.id;
        });
    }
}
