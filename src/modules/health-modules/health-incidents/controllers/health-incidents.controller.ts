import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthIncidentsService } from '../services/health-incidents.service';
import { HealthIncidentDto } from '../dto/health-incident.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Health Incidents')
@ApiBearerAuth('access-token')
@Controller('health-incidents')
export class HealthIncidentsController {
    constructor(private readonly healthIncidentsService: HealthIncidentsService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List health incidents of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of health incidents.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<HealthIncidentDto>> {
        return await this.healthIncidentsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a health incident by ID' })
    @ApiOkResponse({ type: HealthIncidentDto })
    @ApiNotFound({ code: 'HEALTH_INCIDENT_NOT_FOUND', message: 'Health incident not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<{ healthIncident: HealthIncidentDto }> {
        return { healthIncident: await this.healthIncidentsService.findOneById(HealthIncidentDto, id) };
    }
}
