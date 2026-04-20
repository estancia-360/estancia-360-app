import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';
import { WeightRecordsService } from '../services/weight-records.service';
import { WeightRecordDto } from '../dto/weight-record.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Recría - Pesajes')
@Controller('weight-records')
export class WeightRecordsController {
    constructor(private readonly weightRecordsService: WeightRecordsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({
        summary: 'Listar pesajes de un animal',
        description: 'Retorna todos los registros de peso de un animal ordenados cronológicamente (ASC). Usar para calcular GMD entre pesajes consecutivos.',
    })
    @ApiParam({ name: 'idRanchAnimal', description: 'ID del animal', example: 5 })
    @ApiOkResponse({ description: 'Lista paginada de pesajes' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.weightRecordsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: WeightRecordDto },
        );
        return OkRes(res, result);
    }

    @Get('lot/:idLot')
    @ApiOperation({
        summary: 'Listar pesajes de un lote',
        description: 'Retorna todos los pesajes del lote, útil para estadísticas grupales.',
    })
    @ApiParam({ name: 'idLot', description: 'ID del lote', example: 3 })
    @ApiOkResponse({ description: 'Lista paginada de pesajes del lote' })
    async findAllByLot(
        @Param('idLot', ParseIntPipe) idLot: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.weightRecordsService.findAllByLot(
            idLot,
            pagination,
            { template: WeightRecordDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un pesaje por ID' })
    @ApiParam({ name: 'id', description: 'ID del registro de peso', example: 1 })
    @ApiOkResponse({ description: 'Pesaje encontrado', type: WeightRecordDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const record = await this.weightRecordsService.findOneById(id, {
            throwException: true,
            template: WeightRecordDto,
        });
        return OkRes(res, { weightRecord: record });
    }
}
