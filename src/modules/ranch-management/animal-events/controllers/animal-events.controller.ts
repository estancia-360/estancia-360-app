import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnimalEventsService } from '../services/animal-events.service';
import { AnimalEventDto } from '../dto/animal-event.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

// BUG-09 (auditoria QA E2E, 2026-09-03): estas dos rutas devolvian eventos/historial de
// cualquier estancia con solo autenticarse, sin chequear pertenencia. Mismo hueco que SEC-001.
@ApiTags('Animal Events')
@ApiBearerAuth('access-token')
@Controller('animal-events')
export class AnimalEventsController {
    constructor(
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'Get all events of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of events.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<AnimalEventDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.animalEventsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get an animal event by ID' })
    @ApiOkResponse({ type: AnimalEventDto })
    @ApiNotFound({ code: 'ANIMAL_EVENT_NOT_FOUND', message: 'Animal event not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ animalEvent: AnimalEventDto }> {
        const animalEvent = await this.animalEventsService.findOneById(AnimalEventDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, animalEvent.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { animalEvent };
    }
}
