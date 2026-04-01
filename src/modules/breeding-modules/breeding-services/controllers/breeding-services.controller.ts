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

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los servicios de monta de un animal con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de servicios de monta' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingServicesService.findAllByAnimal(
            idRanchAnimal,
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
