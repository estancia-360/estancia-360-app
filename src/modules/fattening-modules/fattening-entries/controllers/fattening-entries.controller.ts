import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FatteningEntriesService } from '../services/fattening-entries.service';
import { FatteningEntryDto } from '../dto/fattening-entry.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Fattening Entries')
@ApiBearerAuth('access-token')
@Controller('fattening-entries')
export class FatteningEntriesController {
    constructor(
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List fattening entries of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of fattening entries.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<FatteningEntryDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.fatteningEntriesService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a fattening entry by ID' })
    @ApiOkResponse({ type: FatteningEntryDto })
    @ApiNotFound({ code: 'FATTENING_ENTRY_NOT_FOUND', message: 'Fattening entry not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ fatteningEntry: FatteningEntryDto }> {
        const fatteningEntry = await this.fatteningEntriesService.findOneById(FatteningEntryDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, fatteningEntry.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { fatteningEntry };
    }
}
