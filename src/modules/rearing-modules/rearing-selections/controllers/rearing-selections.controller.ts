import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RearingSelectionsService } from '../services/rearing-selections.service';
import { RearingSelectionDto } from '../dto/rearing-selection.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Rearing Selections')
@ApiBearerAuth('access-token')
@Controller('rearing-selections')
export class RearingSelectionsController {
    constructor(private readonly rearingSelectionsService: RearingSelectionsService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List rearing selections of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of rearing selections.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<RearingSelectionDto>> {
        return await this.rearingSelectionsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a rearing selection by ID' })
    @ApiOkResponse({ type: RearingSelectionDto })
    @ApiNotFound({ code: 'REARING_SELECTION_NOT_FOUND', message: 'Rearing selection not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<RearingSelectionDto> {
        return await this.rearingSelectionsService.findOneById(RearingSelectionDto, id);
    }
}
