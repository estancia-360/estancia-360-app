import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { AnimalEventsService } from '../services/animal-events.service';
import { AnimalEventDto } from '../dto/animal-event.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';

@ApiTags('Eventos de animales')
@Controller('animal-events')
export class AnimalEventsController {
    constructor(private readonly animalEventsService: AnimalEventsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los eventos de un animal con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de eventos del animal' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.animalEventsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: AnimalEventDto },
        );
        return OkRes(res, result);
    }

    @Get(':idEvent')
    @ApiOperation({ summary: 'Obtener un evento de animal por ID' })
    @ApiOkResponse({ description: 'Evento encontrado', type: AnimalEventDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('idEvent', ParseIntPipe) idEvent: number,
        @Res() res: express.Response,
    ) {
        const event = await this.animalEventsService.findOneById(idEvent, {
            throwException: true,
            template: AnimalEventDto,
        });
        return OkRes(res, { animalEvent: event });
    }
}
