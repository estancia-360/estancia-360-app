import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import * as express from 'express';
import { CreatedRes, OkRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { HealthService } from './health.service';
import { RegisterVaccinationDto } from './dto/inputs/register-vaccination.dto';
import { UpdateVaccinationDto } from './dto/inputs/update-vaccination.dto';
import { RegisterTreatmentDto } from './dto/inputs/register-treatment.dto';
import { UpdateTreatmentDto } from './dto/inputs/update-treatment.dto';
import { RegisterHealthIncidentDto } from './dto/inputs/register-health-incident.dto';
import { UpdateHealthIncidentDto } from './dto/inputs/update-health-incident.dto';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { TreatmentDto } from 'src/modules/health-modules/treatments/dto/treatment.dto';
import { HealthIncidentDto } from 'src/modules/health-modules/health-incidents/dto/health-incident.dto';

@ApiTags('Sanidad')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    // ─────────────────────────────────────────────────────────────
    //  VACUNACIONES
    // ─────────────────────────────────────────────────────────────

    @Post('vaccination')
    @ApiOperation({
        summary: 'Registrar una vacunación',
        description: 'Registra la aplicación de una vacuna o antiparasitario sin período de retiro. Aplica en cualquier etapa productiva (Cría, Recría, Engorde).',
    })
    @ApiCreatedResponse({ description: 'Vacunación registrada exitosamente', type: VaccinationDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerVaccination(
        @Body() dto: RegisterVaccinationDto,
        @Res() res: express.Response,
    ) {
        const result = await this.healthService.registerVaccination(dto);
        return CreatedRes(res, { vaccination: result });
    }

    @Patch('vaccination/:id')
    @ApiOperation({ summary: 'Actualizar una vacunación' })
    @ApiParam({ name: 'id', description: 'ID de la vacunación', example: 1 })
    @ApiOkResponse({ description: 'Vacunación actualizada exitosamente', type: VaccinationDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateVaccination(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVaccinationDto,
        @Res() res: express.Response,
    ) {
        const result = await this.healthService.updateVaccination(id, dto);
        return OkRes(res, { vaccination: result });
    }

    @Delete('vaccination/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar una vacunación' })
    @ApiParam({ name: 'id', description: 'ID de la vacunación', example: 1 })
    @ApiNoContentResponse({ description: 'Vacunación eliminada exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteVaccination(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.healthService.deleteVaccination(id);
    }

    // ─────────────────────────────────────────────────────────────
    //  TRATAMIENTOS
    // ─────────────────────────────────────────────────────────────

    @Post('treatment')
    @ApiOperation({
        summary: 'Registrar un tratamiento',
        description: `Registra un tratamiento médico (medicamentos, antibióticos, antiparasitarios con retiro).

**RN-18:** si se envía \`withdrawalDays\`, el backend calcula automáticamente \`withdrawalEndDate = eventDate + withdrawalDays\`. Un animal con retiro activo (\`withdrawalEndDate >= hoy\`) no debería poder venderse — ese bloqueo se implementa en el módulo Movimientos.`,
    })
    @ApiCreatedResponse({ description: 'Tratamiento registrado exitosamente', type: TreatmentDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerTreatment(
        @Body() dto: RegisterTreatmentDto,
        @Res() res: express.Response,
    ) {
        const result = await this.healthService.registerTreatment(dto);
        return CreatedRes(res, { treatment: result });
    }

    @Patch('treatment/:id')
    @ApiOperation({
        summary: 'Actualizar un tratamiento',
        description: 'Si se envía un nuevo `withdrawalDays`, el backend recalcula `withdrawalEndDate` en base a la fecha original del evento.',
    })
    @ApiParam({ name: 'id', description: 'ID del tratamiento', example: 1 })
    @ApiOkResponse({ description: 'Tratamiento actualizado exitosamente', type: TreatmentDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateTreatment(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTreatmentDto,
        @Res() res: express.Response,
    ) {
        const result = await this.healthService.updateTreatment(id, dto);
        return OkRes(res, { treatment: result });
    }

    @Delete('treatment/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un tratamiento' })
    @ApiParam({ name: 'id', description: 'ID del tratamiento', example: 1 })
    @ApiNoContentResponse({ description: 'Tratamiento eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteTreatment(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.healthService.deleteTreatment(id);
    }

    // ─────────────────────────────────────────────────────────────
    //  INCIDENTES SANITARIOS
    // ─────────────────────────────────────────────────────────────

    @Post('health-incident')
    @ApiOperation({
        summary: 'Registrar un incidente sanitario',
        description: `Registra la detección de una enfermedad o una cuarentena. La mortalidad NO se registra acá — se registra en \`animal_exits\` (módulo Movimientos).

Si \`incidentType='quarantine'\`, el backend actualiza automáticamente \`ranch_animals.id_status = 2\` (En Observación).`,
    })
    @ApiCreatedResponse({ description: 'Incidente sanitario registrado exitosamente', type: HealthIncidentDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerHealthIncident(
        @Body() dto: RegisterHealthIncidentDto,
        @Res() res: express.Response,
    ) {
        const result = await this.healthService.registerHealthIncident(dto);
        return CreatedRes(res, { healthIncident: result });
    }

    @Patch('health-incident/:id')
    @ApiOperation({
        summary: 'Actualizar un incidente sanitario',
        description: 'Si se marca `resolvedAt` en un incidente de tipo `quarantine` que estaba activo, el backend revierte automáticamente `ranch_animals.id_status = 1` (Activo).',
    })
    @ApiParam({ name: 'id', description: 'ID del incidente sanitario', example: 1 })
    @ApiOkResponse({ description: 'Incidente sanitario actualizado exitosamente', type: HealthIncidentDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateHealthIncident(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateHealthIncidentDto,
        @Res() res: express.Response,
    ) {
        const result = await this.healthService.updateHealthIncident(id, dto);
        return OkRes(res, { healthIncident: result });
    }

    @Delete('health-incident/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un incidente sanitario',
        description: 'Si era una cuarentena todavía activa (sin resolver), el backend revierte al animal a `id_status = 1` (Activo).',
    })
    @ApiParam({ name: 'id', description: 'ID del incidente sanitario', example: 1 })
    @ApiNoContentResponse({ description: 'Incidente sanitario eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteHealthIncident(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.healthService.deleteHealthIncident(id);
    }
}
