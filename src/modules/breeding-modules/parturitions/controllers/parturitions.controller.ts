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

    /**
     * Obtiene todos los partos de una estancia con paginación.
     * Los partos se filtran automáticamente por los animales de la estancia.
     * @param idRanch - ID de la estancia
     * @returns Página de partos de la estancia
     */
    @Get('by-ranch/:idRanch')
    @ApiOperation({ summary: 'Listar partos de una estancia' })
    @ApiOkResponse({ description: 'Lista paginada de partos' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.parturitionsService.findAllByRanch(
            idRanch,
            pagination,
            { template: ParturitionDto },
        );
        return OkRes(res, result);
    }

    /**
     * Obtiene todos los partos de un animal (madre) por código con paginación.
     * @param animalCode - Código del animal (madre)
     * @returns Página de partos del animal
     */
    @Get('by-code/:animalCode')
    @ApiOperation({ summary: 'Listar partos de un animal (madre) por código' })
    @ApiOkResponse({ description: 'Lista paginada de partos del animal' })
    async findAllByAnimalCode(
        @Param('animalCode') animalCode: string,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.parturitionsService.findAllByAnimalCode(
            animalCode,
            pagination,
            { template: ParturitionDto },
        );
        return OkRes(res, result);
    }

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los partos de un animal (como madre) con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de partos' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        // Para mantener compatibilidad, usamos el código del animal
        // En la práctica, el código se debe pasar directamente
        const result = await this.parturitionsService.findAllByAnimalCode(
            idRanchAnimal.toString(),
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
