import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnimalExitsService } from '../services/animal-exits.service';
import { AnimalExitDto } from '../dto/animal-exit.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Animal Exits')
@ApiBearerAuth('access-token')
@Controller('animal-exits')
export class AnimalExitsController {
    constructor(private readonly animalExitsService: AnimalExitsService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List exits of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of exits.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<AnimalExitDto>> {
        return await this.animalExitsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get an exit by ID' })
    @ApiOkResponse({ type: AnimalExitDto })
    @ApiNotFound({ code: 'ANIMAL_EXIT_NOT_FOUND', message: 'Animal exit not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<{ animalExit: AnimalExitDto }> {
        return { animalExit: await this.animalExitsService.findOneById(AnimalExitDto, id) };
    }
}
