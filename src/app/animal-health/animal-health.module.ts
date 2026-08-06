import { Module } from '@nestjs/common';
import { AnimalHealthController } from './animal-health.controller';

import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { AnimalEventsModule } from 'src/modules/ranch-management/animal-events/animal-events.module';
import { VaccinationsModule } from 'src/modules/health-modules/vaccinations/vaccinations.module';
import { TreatmentsModule } from 'src/modules/health-modules/treatments/treatments.module';
import { HealthIncidentsModule } from 'src/modules/health-modules/health-incidents/health-incidents.module';
import { SyncDeletionsModule } from 'src/modules/core/sync-deletions/sync-deletions.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

import { RegisterVaccinationUseCase } from './use-cases/register-vaccination.use-case';
import { UpdateVaccinationUseCase } from './use-cases/update-vaccination.use-case';
import { DeleteVaccinationUseCase } from './use-cases/delete-vaccination.use-case';
import { RegisterTreatmentUseCase } from './use-cases/register-treatment.use-case';
import { UpdateTreatmentUseCase } from './use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from './use-cases/delete-treatment.use-case';
import { RegisterHealthIncidentUseCase } from './use-cases/register-health-incident.use-case';
import { UpdateHealthIncidentUseCase } from './use-cases/update-health-incident.use-case';
import { DeleteHealthIncidentUseCase } from './use-cases/delete-health-incident.use-case';

@Module({
    imports: [RanchAnimalsModule, AnimalEventsModule, VaccinationsModule, TreatmentsModule, HealthIncidentsModule, SyncDeletionsModule, RanchUsersModule],
    controllers: [AnimalHealthController],
    providers: [
        RegisterVaccinationUseCase,
        UpdateVaccinationUseCase,
        DeleteVaccinationUseCase,
        RegisterTreatmentUseCase,
        UpdateTreatmentUseCase,
        DeleteTreatmentUseCase,
        RegisterHealthIncidentUseCase,
        UpdateHealthIncidentUseCase,
        DeleteHealthIncidentUseCase,
    ],
    exports: [
        RegisterVaccinationUseCase,
        UpdateVaccinationUseCase,
        DeleteVaccinationUseCase,
        RegisterTreatmentUseCase,
        UpdateTreatmentUseCase,
        DeleteTreatmentUseCase,
        RegisterHealthIncidentUseCase,
        UpdateHealthIncidentUseCase,
        DeleteHealthIncidentUseCase,
    ],
})
export class AnimalHealthModule {}
