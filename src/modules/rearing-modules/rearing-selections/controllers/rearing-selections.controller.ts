import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';
import { RearingSelectionsService } from '../services/rearing-selections.service';
import { RearingSelectionDto } from '../dto/rearing-selection.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Recría - Selecciones')
@Controller('rearing-selections')
export class RearingSelectionsController {
    constructor(private readonly rearingSelectionsService: RearingSelectionsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({
        summary: 'Listar selecciones de recría de un animal',
        description: 'Retorna todas las selecciones de recría registradas para el animal.',
    })
    @ApiParam({ name: 'idRanchAnimal', description: 'ID del animal', example: 5 })
    @ApiOkResponse({ description: 'Lista paginada de selecciones' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.rearingSelectionsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: RearingSelectionDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una selección de recría por ID' })
    @ApiParam({ name: 'id', description: 'ID de la selección', example: 1 })
    @ApiOkResponse({ description: 'Selección encontrada', type: RearingSelectionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const record = await this.rearingSelectionsService.findOneById(id, {
            throwException: true,
            template: RearingSelectionDto,
        });
        return OkRes(res, { rearingSelection: record });
    }
}
