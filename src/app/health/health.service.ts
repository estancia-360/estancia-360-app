import { Injectable } from '@nestjs/common';
import { RegisterVaccinationDto } from './dto/inputs/register-vaccination.dto';
import { UpdateVaccinationDto } from './dto/inputs/update-vaccination.dto';
import { RegisterTreatmentDto } from './dto/inputs/register-treatment.dto';
import { UpdateTreatmentDto } from './dto/inputs/update-treatment.dto';
import { RegisterHealthIncidentDto } from './dto/inputs/register-health-incident.dto';
import { UpdateHealthIncidentDto } from './dto/inputs/update-health-incident.dto';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { TreatmentDto } from 'src/modules/health-modules/treatments/dto/treatment.dto';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';
import { RegisterVaccinationUseCase } from './use-cases/register-vaccination.use-case';
import { UpdateVaccinationUseCase } from './use-cases/update-vaccination.use-case';
import { DeleteVaccinationUseCase } from './use-cases/delete-vaccination.use-case';
import { RegisterTreatmentUseCase } from './use-cases/register-treatment.use-case';
import { UpdateTreatmentUseCase } from './use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from './use-cases/delete-treatment.use-case';
import { RegisterHealthIncidentUseCase } from './use-cases/register-health-incident.use-case';
import { UpdateHealthIncidentUseCase } from './use-cases/update-health-incident.use-case';
import { DeleteHealthIncidentUseCase } from './use-cases/delete-health-incident.use-case';

@Injectable()
export class HealthService {
    constructor(
        private readonly registerVaccinationUseCase: RegisterVaccinationUseCase,
        private readonly updateVaccinationUseCase: UpdateVaccinationUseCase,
        private readonly deleteVaccinationUseCase: DeleteVaccinationUseCase,
        private readonly registerTreatmentUseCase: RegisterTreatmentUseCase,
        private readonly updateTreatmentUseCase: UpdateTreatmentUseCase,
        private readonly deleteTreatmentUseCase: DeleteTreatmentUseCase,
        private readonly registerHealthIncidentUseCase: RegisterHealthIncidentUseCase,
        private readonly updateHealthIncidentUseCase: UpdateHealthIncidentUseCase,
        private readonly deleteHealthIncidentUseCase: DeleteHealthIncidentUseCase,
    ) {}

    registerVaccination(dto: RegisterVaccinationDto): Promise<VaccinationDto> {
        return this.registerVaccinationUseCase.execute(dto);
    }

    updateVaccination(id: number, dto: UpdateVaccinationDto): Promise<VaccinationDto> {
        return this.updateVaccinationUseCase.execute(id, dto);
    }

    deleteVaccination(id: number): Promise<void> {
        return this.deleteVaccinationUseCase.execute(id);
    }

    registerTreatment(dto: RegisterTreatmentDto): Promise<TreatmentDto> {
        return this.registerTreatmentUseCase.execute(dto);
    }

    updateTreatment(id: number, dto: UpdateTreatmentDto): Promise<TreatmentDto> {
        return this.updateTreatmentUseCase.execute(id, dto);
    }

    deleteTreatment(id: number): Promise<void> {
        return this.deleteTreatmentUseCase.execute(id);
    }

    registerHealthIncident(dto: RegisterHealthIncidentDto): Promise<HealthIncidentDto> {
        return this.registerHealthIncidentUseCase.execute(dto);
    }

    updateHealthIncident(id: number, dto: UpdateHealthIncidentDto): Promise<HealthIncidentDto> {
        return this.updateHealthIncidentUseCase.execute(id, dto);
    }

    deleteHealthIncident(id: number): Promise<void> {
        return this.deleteHealthIncidentUseCase.execute(id);
    }
}
