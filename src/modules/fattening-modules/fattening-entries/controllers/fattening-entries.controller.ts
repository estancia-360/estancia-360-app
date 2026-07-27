import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FatteningEntriesService } from '../services/fattening-entries.service';
import { FatteningEntryDto } from '../dto/fattening-entry.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Fattening Entries')
@ApiBearerAuth('access-token')
@Controller('fattening-entries')
export class FatteningEntriesController {
    constructor(private readonly fatteningEntriesService: FatteningEntriesService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List fattening entries of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of fattening entries.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<FatteningEntryDto>> {
        return await this.fatteningEntriesService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a fattening entry by ID' })
    @ApiOkResponse({ type: FatteningEntryDto })
    @ApiNotFound({ code: 'FATTENING_ENTRY_NOT_FOUND', message: 'Fattening entry not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<FatteningEntryDto> {
        return await this.fatteningEntriesService.findOneById(FatteningEntryDto, id);
    }
}
