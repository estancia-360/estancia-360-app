import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnimalEventsService } from '../services/animal-events.service';
import { AnimalEventDto } from '../dto/animal-event.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Animal Events')
@ApiBearerAuth('access-token')
@Controller('animal-events')
export class AnimalEventsController {
    constructor(private readonly animalEventsService: AnimalEventsService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'Get all events of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of events.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<AnimalEventDto>> {
        return await this.animalEventsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get an animal event by ID' })
    @ApiOkResponse({ type: AnimalEventDto })
    @ApiNotFound({ code: 'ANIMAL_EVENT_NOT_FOUND', message: 'Animal event not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<{ animalEvent: AnimalEventDto }> {
        return { animalEvent: await this.animalEventsService.findOneById(AnimalEventDto, id) };
    }
}
