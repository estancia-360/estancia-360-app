import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VaccinationsService } from '../services/vaccinations.service';
import { VaccinationDto } from '../dto/vaccination.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Vaccinations')
@ApiBearerAuth('access-token')
@Controller('vaccinations')
export class VaccinationsController {
    constructor(private readonly vaccinationsService: VaccinationsService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List vaccinations of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of vaccinations.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<VaccinationDto>> {
        return await this.vaccinationsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a vaccination by ID' })
    @ApiOkResponse({ type: VaccinationDto })
    @ApiNotFound({ code: 'VACCINATION_NOT_FOUND', message: 'Vaccination not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<{ vaccination: VaccinationDto }> {
        return { vaccination: await this.vaccinationsService.findOneById(VaccinationDto, id) };
    }
}
