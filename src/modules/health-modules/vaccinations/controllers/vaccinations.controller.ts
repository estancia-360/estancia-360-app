import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { VaccinationsService } from '../services/vaccinations.service';
import { VaccinationDto } from '../dto/vaccination.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Sanidad — Vacunaciones')
@Controller('vaccinations')
export class VaccinationsController {
    constructor(private readonly vaccinationsService: VaccinationsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Listar vacunaciones de un animal' })
    @ApiParam({ name: 'idRanchAnimal', description: 'ID del animal', example: 4 })
    @ApiOkResponse({ description: 'Lista paginada de vacunaciones del animal' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.vaccinationsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: VaccinationDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una vacunación por ID' })
    @ApiParam({ name: 'id', description: 'ID de la vacunación', example: 1 })
    @ApiOkResponse({ description: 'Vacunación encontrada', type: VaccinationDto })
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const vaccination = await this.vaccinationsService.findOneById(id, {
            throwException: true,
            template: VaccinationDto,
        });
        return OkRes(res, { vaccination });
    }
}
