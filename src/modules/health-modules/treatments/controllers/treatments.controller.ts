import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { TreatmentsService } from '../services/treatments.service';
import { TreatmentDto } from '../dto/treatment.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Sanidad — Tratamientos')
@Controller('treatments')
export class TreatmentsController {
    constructor(private readonly treatmentsService: TreatmentsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Listar tratamientos de un animal' })
    @ApiParam({ name: 'idRanchAnimal', description: 'ID del animal', example: 4 })
    @ApiOkResponse({ description: 'Lista paginada de tratamientos del animal' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.treatmentsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: TreatmentDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un tratamiento por ID' })
    @ApiParam({ name: 'id', description: 'ID del tratamiento', example: 1 })
    @ApiOkResponse({ description: 'Tratamiento encontrado', type: TreatmentDto })
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const treatment = await this.treatmentsService.findOneById(id, {
            throwException: true,
            template: TreatmentDto,
        });
        return OkRes(res, { treatment });
    }
}
