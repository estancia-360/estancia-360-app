import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VaccinationsService } from '../services/vaccinations.service';
import { VaccinationDto } from '../dto/vaccination.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Vaccinations')
@ApiBearerAuth('access-token')
@Controller('vaccinations')
export class VaccinationsController {
    constructor(
        private readonly vaccinationsService: VaccinationsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List vaccinations of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of vaccinations.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<VaccinationDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.vaccinationsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a vaccination by ID' })
    @ApiOkResponse({ type: VaccinationDto })
    @ApiNotFound({ code: 'VACCINATION_NOT_FOUND', message: 'Vaccination not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ vaccination: VaccinationDto }> {
        const vaccination = await this.vaccinationsService.findOneById(VaccinationDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, vaccination.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { vaccination };
    }
}
