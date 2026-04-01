import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { WeaningsService } from '../services/weanings.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';
import { WeaningDto } from '../dto/weaning.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Destetes')
@Controller('weanings')
export class WeaningsController {
    constructor(private readonly weaningsService: WeaningsService) {}

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los destetes de un animal con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de destetes' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.weaningsService.findAllByAnimal(
            idRanchAnimal,
            pagination,
            { template: WeaningDto },
        );
        return OkRes(res, result);
    }

    @Get(':idWeaning')
    @ApiOperation({ summary: 'Obtener un destete por ID' })
    @ApiOkResponse({ description: 'Destete encontrado', type: WeaningDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('idWeaning', ParseIntPipe) idWeaning: number,
        @Res() res: express.Response,
    ) {
        const weaning = await this.weaningsService.findOneById(idWeaning, {
            throwException: true,
            template: WeaningDto,
        });
        return OkRes(res, { weaning });
    }
}
