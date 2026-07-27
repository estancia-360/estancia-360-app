import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GestationDiagnosesService } from '../services/gestation-diagnoses.service';
import { GestationDiagnosisDto } from '../dto/gestation-diagnosis.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Gestation Diagnoses')
@ApiBearerAuth('access-token')
@Controller('gestation-diagnoses')
export class GestationDiagnosesController {
    constructor(private readonly gestationDiagnosesService: GestationDiagnosesService) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List gestation diagnoses of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of gestation diagnoses.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<GestationDiagnosisDto>> {
        return await this.gestationDiagnosesService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List gestation diagnoses of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of gestation diagnoses.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<GestationDiagnosisDto>> {
        return await this.gestationDiagnosesService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idDiagnosis')
    @UserUp()
    @ApiOperation({ summary: 'Get a gestation diagnosis by ID' })
    @ApiOkResponse({ type: GestationDiagnosisDto })
    @ApiNotFound({ code: 'GESTATION_DIAGNOSIS_NOT_FOUND', message: 'Gestation diagnosis not found.' })
    async findOneById(@Param('idDiagnosis', ParseIntPipe) idDiagnosis: number): Promise<{ gestationDiagnosis: GestationDiagnosisDto }> {
        return { gestationDiagnosis: await this.gestationDiagnosesService.findOneById(GestationDiagnosisDto, idDiagnosis) };
    }
}
