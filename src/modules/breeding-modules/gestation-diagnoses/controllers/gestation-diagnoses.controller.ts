import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GestationDiagnosesService } from '../services/gestation-diagnoses.service';
import { GestationDiagnosisDto } from '../dto/gestation-diagnosis.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Gestation Diagnoses')
@ApiBearerAuth('access-token')
@Controller('gestation-diagnoses')
export class GestationDiagnosesController {
    constructor(
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List gestation diagnoses of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of gestation diagnoses.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<GestationDiagnosisDto>> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return await this.gestationDiagnosesService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List gestation diagnoses of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of gestation diagnoses.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<GestationDiagnosisDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.gestationDiagnosesService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idDiagnosis')
    @UserUp()
    @ApiOperation({ summary: 'Get a gestation diagnosis by ID' })
    @ApiOkResponse({ type: GestationDiagnosisDto })
    @ApiNotFound({ code: 'GESTATION_DIAGNOSIS_NOT_FOUND', message: 'Gestation diagnosis not found.' })
    async findOneById(
        @Param('idDiagnosis', ParseIntPipe) idDiagnosis: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ gestationDiagnosis: GestationDiagnosisDto }> {
        const gestationDiagnosis = await this.gestationDiagnosesService.findOneById(GestationDiagnosisDto, idDiagnosis);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, gestationDiagnosis.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { gestationDiagnosis };
    }
}
