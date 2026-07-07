import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { MovementsService } from '../services/movements.service';
import { MovementDto } from '../dto/movement.dto';
import { MovementStatusEnum, MovementTypeEnum } from '../entities/movement.entity';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Movimientos — Consulta')
@Controller('movements')
export class MovementsController {
    constructor(private readonly movementsService: MovementsService) {}

    @Get('ranch/:idRanch')
    @ApiOperation({ summary: 'Listar movimientos de una estancia' })
    @ApiParam({ name: 'idRanch', description: 'ID de la estancia', example: 1 })
    @ApiQuery({ name: 'movementType', required: false, enum: MovementTypeEnum })
    @ApiQuery({ name: 'status', required: false, enum: MovementStatusEnum })
    @ApiOkResponse({ description: 'Lista paginada de movimientos de la estancia' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @Query('movementType') movementType: MovementTypeEnum | undefined,
        @Query('status') status: MovementStatusEnum | undefined,
        @Res() res: express.Response,
    ) {
        const result = await this.movementsService.findAllByRanch(
            idRanch,
            pagination,
            { template: MovementDto },
            { movementType, status },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un movimiento por ID, con su detalle por animal' })
    @ApiParam({ name: 'id', description: 'ID del movimiento', example: 1 })
    @ApiOkResponse({ description: 'Movimiento encontrado', type: MovementDto })
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const movement = await this.movementsService.findOneById(id, {
            throwException: true,
            template: MovementDto,
        });
        return OkRes(res, { movement });
    }
}
