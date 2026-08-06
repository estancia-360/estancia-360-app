import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BreedingServicesService } from '../services/breeding-services.service';
import { BreedingServiceDto } from '../dto/breeding-service.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Breeding Services')
@ApiBearerAuth('access-token')
@Controller('breeding-services')
export class BreedingServicesController {
    constructor(
        private readonly breedingServicesService: BreedingServicesService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List breeding services of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of breeding services.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<BreedingServiceDto>> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return await this.breedingServicesService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List breeding services of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of breeding services.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<BreedingServiceDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.breedingServicesService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idService')
    @UserUp()
    @ApiOperation({ summary: 'Get a breeding service by ID' })
    @ApiOkResponse({ type: BreedingServiceDto })
    @ApiNotFound({ code: 'BREEDING_SERVICE_NOT_FOUND', message: 'Breeding service not found.' })
    async findOneById(
        @Param('idService', ParseIntPipe) idService: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ breedingService: BreedingServiceDto }> {
        const breedingService = await this.breedingServicesService.findOneById(BreedingServiceDto, idService);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, breedingService.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { breedingService };
    }
}
