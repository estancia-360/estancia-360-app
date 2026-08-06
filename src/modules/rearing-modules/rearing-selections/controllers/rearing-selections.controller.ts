import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RearingSelectionsService } from '../services/rearing-selections.service';
import { RearingSelectionDto } from '../dto/rearing-selection.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Rearing Selections')
@ApiBearerAuth('access-token')
@Controller('rearing-selections')
export class RearingSelectionsController {
    constructor(
        private readonly rearingSelectionsService: RearingSelectionsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List rearing selections of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of rearing selections.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<RearingSelectionDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.rearingSelectionsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a rearing selection by ID' })
    @ApiOkResponse({ type: RearingSelectionDto })
    @ApiNotFound({ code: 'REARING_SELECTION_NOT_FOUND', message: 'Rearing selection not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ rearingSelection: RearingSelectionDto }> {
        const rearingSelection = await this.rearingSelectionsService.findOneById(RearingSelectionDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, rearingSelection.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { rearingSelection };
    }
}
