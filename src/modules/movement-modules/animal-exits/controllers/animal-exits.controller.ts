import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { AnimalExitsService } from '../services/animal-exits.service';
import { AnimalExitDto } from '../dto/animal-exit.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Movimientos — Bajas')
@Controller('animal-exits')
export class AnimalExitsController {
    constructor(private readonly animalExitsService: AnimalExitsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Listar bajas de un animal' })
    @ApiParam({ name: 'idRanchAnimal', description: 'ID del animal', example: 4 })
    @ApiOkResponse({ description: 'Lista paginada de bajas del animal' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.animalExitsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: AnimalExitDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una baja por ID' })
    @ApiParam({ name: 'id', description: 'ID de la baja', example: 1 })
    @ApiOkResponse({ description: 'Baja encontrada', type: AnimalExitDto })
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const animalExit = await this.animalExitsService.findOneById(id, {
            throwException: true,
            template: AnimalExitDto,
        });
        return OkRes(res, { animalExit });
    }
}
