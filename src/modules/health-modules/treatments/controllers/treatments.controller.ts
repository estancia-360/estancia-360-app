import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TreatmentsService } from '../services/treatments.service';
import { TreatmentDto } from '../dto/treatment.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Treatments')
@ApiBearerAuth('access-token')
@Controller('treatments')
export class TreatmentsController {
    constructor(
        private readonly treatmentsService: TreatmentsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List treatments of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of treatments.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<TreatmentDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.treatmentsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a treatment by ID' })
    @ApiOkResponse({ type: TreatmentDto })
    @ApiNotFound({ code: 'TREATMENT_NOT_FOUND', message: 'Treatment not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ treatment: TreatmentDto }> {
        const treatment = await this.treatmentsService.findOneById(TreatmentDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, treatment.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { treatment };
    }
}
