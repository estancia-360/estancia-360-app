import { BadRequestException, Injectable } from '@nestjs/common';
import { BulkImportHealthDto } from '../dto/inputs/bulk-import-health.dto';
import { BulkImportHealthResultDto } from '../dto/outputs/bulk-import-health-result.dto';
import { RegisterVaccinationUseCase } from 'src/app/animal-health/use-cases/register-vaccination.use-case';
import { RegisterTreatmentUseCase } from 'src/app/animal-health/use-cases/register-treatment.use-case';
import { RegisterHealthIncidentUseCase } from 'src/app/animal-health/use-cases/register-health-incident.use-case';
import { UpdateHealthIncidentUseCase } from 'src/app/animal-health/use-cases/update-health-incident.use-case';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { runBulkRows } from '../utils/run-bulk-rows.util';

@Injectable()
export class BulkImportHealthUseCase {
    constructor(
        private readonly registerVaccinationUseCase: RegisterVaccinationUseCase,
        private readonly registerTreatmentUseCase: RegisterTreatmentUseCase,
        private readonly registerHealthIncidentUseCase: RegisterHealthIncidentUseCase,
        private readonly updateHealthIncidentUseCase: UpdateHealthIncidentUseCase,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(dto: BulkImportHealthDto, idUser: number): Promise<BulkImportHealthResultDto> {
        await this.ranchUsersService.assertMember(idUser, dto.idRanch);

        const vaccinations = dto.vaccinations ?? [];
        const treatments = dto.treatments ?? [];
        const healthIncidents = dto.healthIncidents ?? [];
        if (vaccinations.length === 0 && treatments.length === 0 && healthIncidents.length === 0) {
            throw new BadRequestException({ message: 'At least one of vaccinations, treatments or healthIncidents must have rows.', error: 'BULK_IMPORT_EMPTY' });
        }

        return {
            vaccinations: await runBulkRows(vaccinations, async (row) => {
                const record = await this.registerVaccinationUseCase.execute({ ...row, isSynced: false }, idUser);
                return record.id;
            }),
            treatments: await runBulkRows(treatments, async (row) => {
                const record = await this.registerTreatmentUseCase.execute({ ...row, isSynced: false }, idUser);
                return record.id;
            }),
            healthIncidents: await runBulkRows(healthIncidents, async (row) => {
                const record = await this.registerHealthIncidentUseCase.execute({ ...row, isSynced: false }, idUser);
                if (row.resolvedAt) {
                    await this.updateHealthIncidentUseCase.execute(record.id, { resolvedAt: row.resolvedAt }, idUser);
                }
                return record.id;
            }),
        };
    }
}
