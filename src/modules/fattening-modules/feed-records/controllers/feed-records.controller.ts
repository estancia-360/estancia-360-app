import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { FeedRecordsService } from '../services/feed-records.service';
import { FeedRecordDto } from '../dto/feed-record.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Engorde — Alimentación')
@Controller('feed-records')
export class FeedRecordsController {
    constructor(private readonly feedRecordsService: FeedRecordsService) {}

    @Get('lot/:idLot')
    @ApiOperation({ summary: 'Listar registros de alimentación de un lote' })
    @ApiParam({ name: 'idLot', description: 'ID del lote de engorde', example: 3 })
    @ApiOkResponse({ description: 'Lista paginada de registros de alimentación' })
    async findAllByLot(
        @Param('idLot', ParseIntPipe) idLot: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.feedRecordsService.findAllByLot(
            idLot,
            pagination,
            { template: FeedRecordDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un registro de alimentación por ID' })
    @ApiParam({ name: 'id', description: 'ID del registro de alimentación', example: 1 })
    @ApiOkResponse({ description: 'Registro de alimentación encontrado', type: FeedRecordDto })
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const record = await this.feedRecordsService.findOneById(id, {
            throwException: true,
            template: FeedRecordDto,
        });
        return OkRes(res, { feedRecord: record });
    }
}
