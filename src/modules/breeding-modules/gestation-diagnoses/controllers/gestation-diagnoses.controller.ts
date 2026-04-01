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

    @Get('animal/:idRanchAnimal')
    @ApiOperation({ summary: 'Obtener todos los diagnósticos de gestación de un animal con paginación' })
    @ApiOkResponse({ description: 'Lista paginada de diagnósticos de gestación' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @Res() res: express.Response,
    ) {
        const result = await this.gestationDiagnosesService.findAllByAnimal(
            idRanchAnimal,
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
