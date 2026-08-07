import { BadRequestException, Injectable } from '@nestjs/common';
import { BulkImportGestationDto } from '../dto/inputs/bulk-import-gestation.dto';
import { BulkImportResultDto } from '../dto/outputs/bulk-import-result.dto';
import { RegisterGestationDiagnosisUseCase } from 'src/app/breeding/use-cases/register-gestation-diagnosis.use-case';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { runBulkRows } from '../utils/run-bulk-rows.util';

@Injectable()
export class BulkImportGestationUseCase {
    constructor(
        private readonly registerGestationDiagnosisUseCase: RegisterGestationDiagnosisUseCase,
        private readonly breedingServicesService: BreedingServicesService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(dto: BulkImportGestationDto, idUser: number): Promise<BulkImportResultDto> {
        await this.ranchUsersService.assertMember(idUser, dto.idRanch);

        return await runBulkRows(dto.rows, async (row) => {
            const services = await this.breedingServicesService.findAllByAnimal(row.idRanchAnimal, { page: 1, limit: 1 });
            const idService = services.data[0]?.id;
            if (!idService) {
                throw new BadRequestException({
                    message: `No breeding service found for animal ID=${row.idRanchAnimal} — register a service before a diagnosis.`,
                    error: 'BREEDING_SERVICE_NOT_FOUND',
                });
            }

            const diagnosis = await this.registerGestationDiagnosisUseCase.execute({ ...row, idService, isSynced: false }, idUser);
            return diagnosis.id;
        });
    }
}
