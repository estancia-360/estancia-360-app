import { Controller, Get, Param, ParseIntPipe, Query, Res, Post, Body, Put, Delete } from '@nestjs/common';
import { WeaningsService } from '../services/weanings.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { CreatedRes, OkRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { WeaningDto } from '../dto/weaning.dto';
import { CreateWeaningDto } from '../dto/create-weaning.dto';
import { UpdateWeaningDto } from '../dto/update-weaning.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { CommonResponseDto } from 'src/shared/dto';

@ApiTags('Destetes')
@Controller('breeding/weanings')
export class WeaningsController {
    constructor(private readonly weaningsService: WeaningsService) {}

    @Post()
    @ApiOperation({ summary: 'Registrar un destete de cría' })
    @ApiCreatedResponse({
        type: WeaningDto,
        description: 'Destete registrado exitosamente',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async create(
        @Res() res: express.Response,
        @Body() data: CreateWeaningDto,
    ) {
        const weaning = await this.weaningsService.create(data);
        return CreatedRes(res, { weaning });
    }

    @Put(':idWeaning')
    @ApiOperation({ summary: 'Actualizar un destete' })
    @ApiOkResponse({
        type: WeaningDto,
        description: 'Destete actualizado exitosamente',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async update(
        @Param('idWeaning', ParseIntPipe) idWeaning: number,
        @Body() data: UpdateWeaningDto,
        @Res() res: express.Response,
    ) {
        const weaning = await this.weaningsService.update(idWeaning, data);
        return OkRes(res, { weaning });
    }

    @Delete(':idWeaning')
    @ApiOperation({ summary: 'Eliminar un destete' })
    @ApiOkResponse({
        type: CommonResponseDto,
        description: 'Destete eliminado exitosamente',
    })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async delete(
        @Param('idWeaning', ParseIntPipe) idWeaning: number,
        @Res() res: express.Response,
    ) {
        await this.weaningsService.deleteById(idWeaning);
        return OkRes(res, { message: 'Destete eliminado exitosamente' });
    }

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
