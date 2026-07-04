import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { HealthIncidentsService } from '../services/health-incidents.service';
import { HealthIncidentDto } from '../dto/health-incident.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Sanidad — Incidentes')
@Controller('health-incidents')
export class HealthIncidentsController {
    constructor(private readonly healthIncidentsService: HealthIncidentsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Listar incidentes sanitarios de un animal' })
    @ApiParam({ name: 'idRanchAnimal', description: 'ID del animal', example: 4 })
    @ApiOkResponse({ description: 'Lista paginada de incidentes sanitarios del animal' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.healthIncidentsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: HealthIncidentDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un incidente sanitario por ID' })
    @ApiParam({ name: 'id', description: 'ID del incidente sanitario', example: 1 })
    @ApiOkResponse({ description: 'Incidente sanitario encontrado', type: HealthIncidentDto })
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const healthIncident = await this.healthIncidentsService.findOneById(id, {
            throwException: true,
            template: HealthIncidentDto,
        });
        return OkRes(res, { healthIncident });
    }
}
