import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { BreedingServicesService } from '../services/breeding-services.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';
import { BreedingServiceDto } from '../dto/breeding-service.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Servicios de monta')
@Controller('breeding-services')
export class BreedingServicesController {
    constructor(private readonly breedingServicesService: BreedingServicesService) {}

    /**
     * Obtiene todos los servicios de monta de una estancia con paginación.
     * Los servicios se filtran automáticamente por los animales de la estancia.
     * @param idRanch - ID de la estancia
     * @returns Página de servicios de monta de la estancia
     */
    @Get('by-ranch/:idRanch')
    @ApiOperation({ summary: 'Listar servicios de monta de una estancia' })
    @ApiOkResponse({ description: 'Lista paginada de servicios de monta' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingServicesService.findAllByRanch(
            idRanch,
            pagination,
            { template: BreedingServiceDto },
        );
        return OkRes(res, result);
    }

    /**
     * Obtiene todos los servicios de monta de un animal por código con paginación.
     * @param animalCode - Código del animal
     * @returns Página de servicios de monta del animal
     */
    @Get('by-code/:animalCode')
    @ApiOperation({ summary: 'Listar servicios de monta de un animal por código' })
    @ApiOkResponse({ description: 'Lista paginada de servicios de monta del animal' })
    async findAllByAnimalCode(
        @Param('animalCode') animalCode: string,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingServicesService.findAllByAnimalCode(
            animalCode,
            pagination,
            { template: BreedingServiceDto },
        );
        return OkRes(res, result);
    }

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los servicios de monta de un animal con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de servicios de monta' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingServicesService.findAllByAnimalCode(
            idRanchAnimal.toString(),
            pagination,
            { template: BreedingServiceDto },
        );
        return OkRes(res, result);
    }

    @Get(':idService')
    @ApiOperation({ summary: 'Obtener un servicio de monta por ID' })
    @ApiOkResponse({ description: 'Servicio de monta encontrado', type: BreedingServiceDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('idService', ParseIntPipe) idService: number,
        @Res() res: express.Response,
    ) {
        const bs = await this.breedingServicesService.findOneById(idService, {
            throwException: true,
            template: BreedingServiceDto,
        });
        return OkRes(res, { breedingService: bs });
    }
}
