import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';

import { RegisterBreedingServiceUseCase } from './use-cases/register-breeding-service.use-case';
import { RegisterGestationDiagnosisUseCase } from './use-cases/register-gestation-diagnosis.use-case';
import { RegisterParturitionUseCase } from './use-cases/register-parturition.use-case';
import { RegisterWeaningUseCase } from './use-cases/register-weaning.use-case';
import { RegisterAnimalDeclaredHistoryUseCase } from './use-cases/register-animal-declared-history.use-case';

import { UpdateBreedingServiceUseCase } from './use-cases/update-breeding-service.use-case';
import { UpdateGestationDiagnosisUseCase } from './use-cases/update-gestation-diagnosis.use-case';
import { UpdateParturitionUseCase } from './use-cases/update-parturition.use-case';
import { UpdateWeaningUseCase } from './use-cases/update-weaning.use-case';
import { UpdateAnimalDeclaredHistoryUseCase } from './use-cases/update-animal-declared-history.use-case';

import { DeleteBreedingServiceUseCase } from './use-cases/delete-breeding-service.use-case';
import { DeleteGestationDiagnosisUseCase } from './use-cases/delete-gestation-diagnosis.use-case';
import { DeleteParturitionUseCase } from './use-cases/delete-parturition.use-case';
import { DeleteWeaningUseCase } from './use-cases/delete-weaning.use-case';
import { DeleteAnimalDeclaredHistoryUseCase } from './use-cases/delete-animal-declared-history.use-case';

import { RegisterBreedingServiceDto } from './dto/inputs/register-breeding-service.dto';
import { RegisterGestationDiagnosisDto } from './dto/inputs/register-gestation-diagnosis.dto';
import { RegisterParturitionDto } from './dto/inputs/register-parturition.dto';
import { RegisterWeaningDto } from './dto/inputs/register-weaning.dto';
import { RegisterAnimalDeclaredHistoryDto } from './dto/inputs/register-animal-declared-history.dto';
import { UpdateBreedingServiceDto } from './dto/inputs/update-breeding-service.dto';
import { UpdateGestationDiagnosisDto } from './dto/inputs/update-gestation-diagnosis.dto';
import { UpdateParturitionDto } from './dto/inputs/update-parturition.dto';
import { UpdateWeaningDto } from './dto/inputs/update-weaning.dto';
import { UpdateAnimalDeclaredHistoryDto } from './dto/inputs/update-animal-declared-history.dto';

import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';

@ApiTags('Breeding — Cría')
@ApiBearerAuth('access-token')
@Controller('breeding')
export class BreedingController {
    constructor(
        private readonly registerBreedingServiceUseCase: RegisterBreedingServiceUseCase,
        private readonly registerGestationDiagnosisUseCase: RegisterGestationDiagnosisUseCase,
        private readonly registerParturitionUseCase: RegisterParturitionUseCase,
        private readonly registerWeaningUseCase: RegisterWeaningUseCase,
        private readonly registerAnimalDeclaredHistoryUseCase: RegisterAnimalDeclaredHistoryUseCase,

        private readonly updateBreedingServiceUseCase: UpdateBreedingServiceUseCase,
        private readonly updateGestationDiagnosisUseCase: UpdateGestationDiagnosisUseCase,
        private readonly updateParturitionUseCase: UpdateParturitionUseCase,
        private readonly updateWeaningUseCase: UpdateWeaningUseCase,
        private readonly updateAnimalDeclaredHistoryUseCase: UpdateAnimalDeclaredHistoryUseCase,

        private readonly deleteBreedingServiceUseCase: DeleteBreedingServiceUseCase,
        private readonly deleteGestationDiagnosisUseCase: DeleteGestationDiagnosisUseCase,
        private readonly deleteParturitionUseCase: DeleteParturitionUseCase,
        private readonly deleteWeaningUseCase: DeleteWeaningUseCase,
        private readonly deleteAnimalDeclaredHistoryUseCase: DeleteAnimalDeclaredHistoryUseCase,
    ) {}

    // ── Register ────────────────────────────────────────────────

    @Post('breeding-service')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a breeding service (natural, AI or embryo transfer)' })
    async registerBreedingService(
        @Body() dto: RegisterBreedingServiceDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ breedingService: BreedingServiceDto }> {
        return { breedingService: await this.registerBreedingServiceUseCase.execute(dto, idUser) };
    }

    @Post('gestation-diagnosis')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a gestation diagnosis for a previous breeding service' })
    async registerGestationDiagnosis(
        @Body() dto: RegisterGestationDiagnosisDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ gestationDiagnosis: GestationDiagnosisDto }> {
        return { gestationDiagnosis: await this.registerGestationDiagnosisUseCase.execute(dto, idUser) };
    }

    @Post('parturition')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a birth for a female with a positive gestation diagnosis' })
    async registerParturition(
        @Body() dto: RegisterParturitionDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ parturition: ParturitionDto }> {
        return { parturition: await this.registerParturitionUseCase.execute(dto, idUser) };
    }

    @Post('weaning')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a weaning for a calf' })
    async registerWeaning(
        @Body() dto: RegisterWeaningDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ weaning: WeaningDto }> {
        return { weaning: await this.registerWeaningUseCase.execute(dto, idUser) };
    }

    @Post('animal-declared-history')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Register an animal's declared reproductive history (pre-system data)" })
    async registerAnimalDeclaredHistory(
        @Body() dto: RegisterAnimalDeclaredHistoryDto,
    ): Promise<{ history: AnimalDeclaredHistoryDto }> {
        return { history: await this.registerAnimalDeclaredHistoryUseCase.execute(dto) };
    }

    // ── Update ──────────────────────────────────────────────────

    @Patch('breeding-service/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a breeding service' })
    async updateBreedingService(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBreedingServiceDto,
    ): Promise<{ breedingService: BreedingServiceDto }> {
        return { breedingService: await this.updateBreedingServiceUseCase.execute(id, dto) };
    }

    @Patch('gestation-diagnosis/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a gestation diagnosis' })
    async updateGestationDiagnosis(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateGestationDiagnosisDto,
    ): Promise<{ gestationDiagnosis: GestationDiagnosisDto }> {
        return { gestationDiagnosis: await this.updateGestationDiagnosisUseCase.execute(id, dto) };
    }

    @Patch('parturition/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a parturition' })
    async updateParturition(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateParturitionDto,
    ): Promise<{ parturition: ParturitionDto }> {
        return { parturition: await this.updateParturitionUseCase.execute(id, dto) };
    }

    @Patch('weaning/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a weaning' })
    async updateWeaning(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWeaningDto,
    ): Promise<{ weaning: WeaningDto }> {
        return { weaning: await this.updateWeaningUseCase.execute(id, dto) };
    }

    @Patch('animal-declared-history/:id')
    @UserUp()
    @ApiOperation({ summary: "Update an animal's declared reproductive history" })
    async updateAnimalDeclaredHistory(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAnimalDeclaredHistoryDto,
    ): Promise<{ history: AnimalDeclaredHistoryDto }> {
        return { history: await this.updateAnimalDeclaredHistoryUseCase.execute(id, dto) };
    }

    // ── Delete ──────────────────────────────────────────────────

    @Delete('breeding-service/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a breeding service (cascades to diagnosis → parturition)' })
    async deleteBreedingService(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteBreedingServiceUseCase.execute(id);
    }

    @Delete('gestation-diagnosis/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a gestation diagnosis (cascades to its parturition, if any)' })
    async deleteGestationDiagnosis(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteGestationDiagnosisUseCase.execute(id);
    }

    @Delete('parturition/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a parturition' })
    async deleteParturition(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteParturitionUseCase.execute(id);
    }

    @Delete('weaning/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a weaning (reverts the calf to ps=Cría, clears its lot)' })
    async deleteWeaning(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteWeaningUseCase.execute(id);
    }

    @Delete('animal-declared-history/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: "Delete an animal's declared reproductive history" })
    async deleteAnimalDeclaredHistory(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteAnimalDeclaredHistoryUseCase.execute(id);
    }
}
