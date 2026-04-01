import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { AnimalDeclaredHistoryService } from '../services/animal-declared-history.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';
import { AnimalDeclaredHistoryDto } from '../dto/animal-declared-history.dto';

@ApiTags('Historial declarado de animales')
@Controller('animal-declared-history')
export class AnimalDeclaredHistoryController {
    constructor(private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener el historial declarado de un animal por el ID del animal' })
    @ApiOkResponse({ description: 'Historial declarado encontrado', type: AnimalDeclaredHistoryDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneByAnimalId(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Res() res: express.Response,
    ) {
        const history = await this.animalDeclaredHistoryService.findOneByAnimalId(idRanchAnimal, {
            throwException: true,
            template: AnimalDeclaredHistoryDto,
        });
        return OkRes(res, { history });
    }

    @Get(':idHistory')
    @ApiOperation({ summary: 'Obtener un historial declarado por su ID' })
    @ApiOkResponse({ description: 'Historial declarado encontrado', type: AnimalDeclaredHistoryDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('idHistory', ParseIntPipe) idHistory: number,
        @Res() res: express.Response,
    ) {
        const history = await this.animalDeclaredHistoryService.findOneById(idHistory, {
            throwException: true,
            template: AnimalDeclaredHistoryDto,
        });
        return OkRes(res, { history });
    }
}
