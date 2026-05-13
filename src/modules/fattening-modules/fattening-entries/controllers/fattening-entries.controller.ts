import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { FatteningEntriesService } from '../services/fattening-entries.service';
import { FatteningEntryDto } from '../dto/fattening-entry.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Engorde — Ingresos')
@Controller('fattening-entries')
export class FatteningEntriesController {
    constructor(private readonly fatteningEntriesService: FatteningEntriesService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Listar ingresos a engorde de un animal' })
    @ApiParam({ name: 'idRanchAnimal', description: 'ID del animal', example: 4 })
    @ApiOkResponse({ description: 'Lista paginada de ingresos a engorde del animal' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.fatteningEntriesService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: FatteningEntryDto },
        );
        return OkRes(res, result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un ingreso a engorde por ID' })
    @ApiParam({ name: 'id', description: 'ID del registro de ingreso a engorde', example: 1 })
    @ApiOkResponse({ description: 'Ingreso a engorde encontrado', type: FatteningEntryDto })
    async findOneById(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const entry = await this.fatteningEntriesService.findOneById(id, {
            throwException: true,
            template: FatteningEntryDto,
        });
        return OkRes(res, { fatteningEntry: entry });
    }
}
