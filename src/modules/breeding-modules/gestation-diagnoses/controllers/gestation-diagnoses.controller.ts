import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { GestationDiagnosesService } from '../services/gestation-diagnoses.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerNotFoundCommon } from 'src/shared/utils';
import { GestationDiagnosisDto } from '../dto/gestation-diagnosis.dto';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

@ApiTags('Diagnósticos de gestación')
@Controller('gestation-diagnoses')
export class GestationDiagnosesController {
    constructor(private readonly gestationDiagnosesService: GestationDiagnosesService) {}

    /**
     * Obtiene todos los diagnósticos de gestación de una estancia con paginación.
     * Los diagnósticos se filtran automáticamente por los animales de la estancia.
     * @param idRanch - ID de la estancia
     * @returns Página de diagnósticos de gestación de la estancia
     */
    @Get('by-ranch/:idRanch')
    @ApiOperation({ summary: 'Listar diagnósticos de gestación de una estancia' })
    @ApiOkResponse({ description: 'Lista paginada de diagnósticos de gestación' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.gestationDiagnosesService.findAllByRanch(
            idRanch,
            pagination,
            { template: GestationDiagnosisDto },
        );
        return OkRes(res, result);
    }

    /**
     * Obtiene todos los diagnósticos de gestación de un animal por código con paginación.
     * @param animalCode - Código del animal
     * @returns Página de diagnósticos de gestación del animal
     */
    @Get('by-code/:animalCode')
    @ApiOperation({ summary: 'Listar diagnósticos de gestación de un animal por código' })
    @ApiOkResponse({ description: 'Lista paginada de diagnósticos de gestación del animal' })
    async findAllByAnimalCode(
        @Param('animalCode') animalCode: string,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.gestationDiagnosesService.findAllByAnimalCode(
            animalCode,
            pagination,
            { template: GestationDiagnosisDto },
        );
        return OkRes(res, result);
    }

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los diagnósticos de gestación de un animal con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de diagnósticos de gestación' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        // Para mantener compatibilidad, usamos el código del animal
        // En la práctica, el código se debe pasar directamente
        const result = await this.gestationDiagnosesService.findAllByAnimalCode(
            idRanchAnimal.toString(),
            pagination,
            { template: GestationDiagnosisDto },
        );
        return OkRes(res, result);
    }

    @Get(':idDiagnosis')
    @ApiOperation({ summary: 'Obtener un diagnóstico de gestación por ID' })
    @ApiOkResponse({ description: 'Diagnóstico de gestación encontrado', type: GestationDiagnosisDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOneById(
        @Param('idDiagnosis', ParseIntPipe) idDiagnosis: number,
        @Res() res: express.Response,
    ) {
        const gd = await this.gestationDiagnosesService.findOneById(idDiagnosis, {
            throwException: true,
            template: GestationDiagnosisDto,
        });
        return OkRes(res, { gestationDiagnosis: gd });
    }
}
