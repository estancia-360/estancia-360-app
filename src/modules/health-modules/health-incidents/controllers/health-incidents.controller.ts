import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthIncidentsService } from '../services/health-incidents.service';
import { HealthIncidentDto } from '../dto/health-incident.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Health Incidents')
@ApiBearerAuth('access-token')
@Controller('health-incidents')
export class HealthIncidentsController {
    constructor(
        private readonly healthIncidentsService: HealthIncidentsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List health incidents of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of health incidents.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<HealthIncidentDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.healthIncidentsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a health incident by ID' })
    @ApiOkResponse({ type: HealthIncidentDto })
    @ApiNotFound({ code: 'HEALTH_INCIDENT_NOT_FOUND', message: 'Health incident not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ healthIncident: HealthIncidentDto }> {
        const healthIncident = await this.healthIncidentsService.findOneById(HealthIncidentDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, healthIncident.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { healthIncident };
    }
}
