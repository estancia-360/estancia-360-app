import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';

import { BulkImportAnimalsUseCase } from './use-cases/bulk-import-animals.use-case';
import { BulkImportWeightsUseCase } from './use-cases/bulk-import-weights.use-case';
import { BulkImportGestationUseCase } from './use-cases/bulk-import-gestation.use-case';
import { BulkImportHealthUseCase } from './use-cases/bulk-import-health.use-case';
import { BulkImportMovementsUseCase } from './use-cases/bulk-import-movements.use-case';

import { BulkImportAnimalsDto } from './dto/inputs/bulk-import-animals.dto';
import { BulkImportWeightsDto } from './dto/inputs/bulk-import-weights.dto';
import { BulkImportGestationDto } from './dto/inputs/bulk-import-gestation.dto';
import { BulkImportHealthDto } from './dto/inputs/bulk-import-health.dto';
import { BulkImportMovementsDto } from './dto/inputs/bulk-import-movements.dto';

import { BulkImportResultDto } from './dto/outputs/bulk-import-result.dto';
import { BulkImportHealthResultDto } from './dto/outputs/bulk-import-health-result.dto';
import { BulkImportMovementsResultDto } from './dto/outputs/bulk-import-movements-result.dto';

/**
 * Cargas masivas — la web parsea el Excel y resuelve códigos/nombres contra los catálogos
 * (animal, lote, raza, clase) ANTES de mandar acá: cada fila/grupo llega con los mismos campos
 * que el endpoint online de un solo registro, más `rowIndex` para poder mapear errores a filas.
 * Cada use-case corre las filas SECUENCIALMENTE (nunca en paralelo — el chequeo de capacidad del
 * plan es lectura-luego-escritura y correría condición de carrera bajo concurrencia) reusando el
 * use-case online existente por fila, así que heredan automáticamente toda regla de negocio
 * (RN-09, RN-12, RN-18, capacidad de plan, rubro habilitado) sin duplicar lógica.
 */
@ApiTags('Bulk Import')
@ApiBearerAuth('access-token')
@Controller('bulk-import')
export class BulkImportController {
    constructor(
        private readonly bulkImportAnimalsUseCase: BulkImportAnimalsUseCase,
        private readonly bulkImportWeightsUseCase: BulkImportWeightsUseCase,
        private readonly bulkImportGestationUseCase: BulkImportGestationUseCase,
        private readonly bulkImportHealthUseCase: BulkImportHealthUseCase,
        private readonly bulkImportMovementsUseCase: BulkImportMovementsUseCase,
    ) {}

    @Post('animals')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk-register animals (Planilla_Alta_Inventario.xlsx)' })
    async importAnimals(@Body() dto: BulkImportAnimalsDto, @CurrentUser('id') idUser: number): Promise<BulkImportResultDto> {
        return await this.bulkImportAnimalsUseCase.execute(dto, idUser);
    }

    @Post('weights')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk-register weight records (Registros_Pesajes.xlsx)' })
    async importWeights(@Body() dto: BulkImportWeightsDto, @CurrentUser('id') idUser: number): Promise<BulkImportResultDto> {
        return await this.bulkImportWeightsUseCase.execute(dto, idUser);
    }

    @Post('gestation')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk-register pregnancy diagnoses / tactos (Planilla_Gestación.xlsx)' })
    async importGestation(@Body() dto: BulkImportGestationDto, @CurrentUser('id') idUser: number): Promise<BulkImportResultDto> {
        return await this.bulkImportGestationUseCase.execute(dto, idUser);
    }

    @Post('health')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk-register vaccinations/treatments/health incidents (Plantilla_Carga_Masiva_Sanidad_Estancia360.xlsx)' })
    async importHealth(@Body() dto: BulkImportHealthDto, @CurrentUser('id') idUser: number): Promise<BulkImportHealthResultDto> {
        return await this.bulkImportHealthUseCase.execute(dto, idUser);
    }

    @Post('movements')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk-register movements + exits (Plantilla_Carga_Masiva_Movimientos_Estancia360.xlsx)' })
    async importMovements(@Body() dto: BulkImportMovementsDto, @CurrentUser('id') idUser: number): Promise<BulkImportMovementsResultDto> {
        return await this.bulkImportMovementsUseCase.execute(dto, idUser);
    }
}
