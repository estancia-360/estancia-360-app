import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ParturitionsService } from '../services/parturitions.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';
import { ParturitionDto } from '../dto/parturition.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Partos')
@Controller('parturitions')
export class ParturitionsController {
    constructor(private readonly parturitionsService: ParturitionsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los partos de un animal (como madre) con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de partos' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.parturitionsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: ParturitionDto },
        );
        return OkRes(res, result);
    }

    @Get(':idParturition')
    @ApiOperation({ summary: 'Obtener un parto por ID' })
    @ApiOkResponse({ description: 'Parto encontrado', type: ParturitionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('idParturition', ParseIntPipe) idParturition: number,
        @Res() res: express.Response,
    ) {
        const parturition = await this.parturitionsService.findOneById(idParturition, {
            throwException: true,
            template: ParturitionDto,
        });
        return OkRes(res, { parturition });
    }
}
