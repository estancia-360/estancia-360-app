import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';

import { RegisterVaccinationUseCase } from './use-cases/register-vaccination.use-case';
import { UpdateVaccinationUseCase } from './use-cases/update-vaccination.use-case';
import { DeleteVaccinationUseCase } from './use-cases/delete-vaccination.use-case';
import { RegisterTreatmentUseCase } from './use-cases/register-treatment.use-case';
import { UpdateTreatmentUseCase } from './use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from './use-cases/delete-treatment.use-case';
import { RegisterHealthIncidentUseCase } from './use-cases/register-health-incident.use-case';
import { UpdateHealthIncidentUseCase } from './use-cases/update-health-incident.use-case';
import { DeleteHealthIncidentUseCase } from './use-cases/delete-health-incident.use-case';

import { RegisterVaccinationDto } from './dto/inputs/register-vaccination.dto';
import { UpdateVaccinationDto } from './dto/inputs/update-vaccination.dto';
import { RegisterTreatmentDto } from './dto/inputs/register-treatment.dto';
import { UpdateTreatmentDto } from './dto/inputs/update-treatment.dto';
import { RegisterHealthIncidentDto } from './dto/inputs/register-health-incident.dto';
import { UpdateHealthIncidentDto } from './dto/inputs/update-health-incident.dto';

import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { TreatmentDto } from 'src/modules/health-modules/treatments/dto/treatment.dto';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';

// Ruta "health" (no "animal-health") — es lo que el viejo expone y lo que el
// móvil ya consume. La carpeta se llama animal-health solo para no chocar
// con app/health/ (el health-check de infraestructura del scaffold nuevo,
// GET /health sin relación con Sanidad) — ambos controllers coexisten bajo
// el mismo prefijo de ruta sin colisionar (métodos y sub-rutas distintos).
@ApiTags('Animal Health — Sanidad')
@ApiBearerAuth('access-token')
@Controller('health')
export class AnimalHealthController {
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

    // ── Vaccinations ────────────────────────────────────────────

    @Post('vaccination')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a vaccination (or a withdrawal-free antiparasitic)' })
    async registerVaccination(
        @Body() dto: RegisterVaccinationDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ vaccination: VaccinationDto }> {
        return { vaccination: await this.registerVaccinationUseCase.execute(dto, idUser) };
    }

    @Patch('vaccination/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a vaccination' })
    async updateVaccination(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVaccinationDto,
    ): Promise<{ vaccination: VaccinationDto }> {
        return { vaccination: await this.updateVaccinationUseCase.execute(id, dto) };
    }

    @Delete('vaccination/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a vaccination' })
    async deleteVaccination(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteVaccinationUseCase.execute(id);
    }

    // ── Treatments ──────────────────────────────────────────────

    @Post('treatment')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register a treatment',
        description:
            'RN-18: if withdrawalDays is sent, the backend computes withdrawalEndDate = eventDate + withdrawalDays. Selling an animal under active withdrawal is blocked in Movimientos.',
    })
    async registerTreatment(
        @Body() dto: RegisterTreatmentDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ treatment: TreatmentDto }> {
        return { treatment: await this.registerTreatmentUseCase.execute(dto, idUser) };
    }

    @Patch('treatment/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a treatment (recomputes withdrawalEndDate if withdrawalDays changes)' })
    async updateTreatment(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTreatmentDto,
    ): Promise<{ treatment: TreatmentDto }> {
        return { treatment: await this.updateTreatmentUseCase.execute(id, dto) };
    }

    @Delete('treatment/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a treatment' })
    async deleteTreatment(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteTreatmentUseCase.execute(id);
    }

    // ── Health incidents ────────────────────────────────────────

    @Post('health-incident')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register a health incident (illness detected or quarantine)',
        description: 'Mortality is NOT registered here — see animal_exits (Movimientos). "quarantine" sets ranch_animals.id_status=2 automatically.',
    })
    async registerHealthIncident(
        @Body() dto: RegisterHealthIncidentDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ healthIncident: HealthIncidentDto }> {
        return { healthIncident: await this.registerHealthIncidentUseCase.execute(dto, idUser) };
    }

    @Patch('health-incident/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a health incident (resolving an active quarantine reverts the animal to Activo)' })
    async updateHealthIncident(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateHealthIncidentDto,
    ): Promise<{ healthIncident: HealthIncidentDto }> {
        return { healthIncident: await this.updateHealthIncidentUseCase.execute(id, dto) };
    }

    @Delete('health-incident/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a health incident (reverts an unresolved quarantine to Activo)' })
    async deleteHealthIncident(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteHealthIncidentUseCase.execute(id);
    }
}
