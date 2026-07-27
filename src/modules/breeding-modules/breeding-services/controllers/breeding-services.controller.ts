import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BreedingServicesService } from '../services/breeding-services.service';
import { BreedingServiceDto } from '../dto/breeding-service.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Breeding Services')
@ApiBearerAuth('access-token')
@Controller('breeding-services')
export class BreedingServicesController {
    constructor(private readonly breedingServicesService: BreedingServicesService) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List breeding services of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of breeding services.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<BreedingServiceDto>> {
        return await this.breedingServicesService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List breeding services of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of breeding services.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<BreedingServiceDto>> {
        return await this.breedingServicesService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idService')
    @UserUp()
    @ApiOperation({ summary: 'Get a breeding service by ID' })
    @ApiOkResponse({ type: BreedingServiceDto })
    @ApiNotFound({ code: 'BREEDING_SERVICE_NOT_FOUND', message: 'Breeding service not found.' })
    async findOneById(@Param('idService', ParseIntPipe) idService: number): Promise<{ breedingService: BreedingServiceDto }> {
        return { breedingService: await this.breedingServicesService.findOneById(BreedingServiceDto, idService) };
    }
}
