import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import * as express from 'express';
import { CreatedRes, OkRes, SwaggerBadRequestCommon, SwaggerConflictCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { BreedingService } from './breeding.service';
import { RegisterBreedingServiceDto } from './dto/inputs/register-breeding-service.dto';
import { RegisterGestationDiagnosisDto } from './dto/inputs/register-gestation-diagnosis.dto';
import { RegisterParturitionDto } from './dto/inputs/register-parturition.dto';
import { RegisterWeaningDto } from './dto/inputs/register-weaning.dto';
import { SyncBreedingDto } from './dto/inputs/sync-breeding.dto';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { SyncBreedingResponseDto } from './dto/outputs/sync-breeding-response.dto';
import { RegisterAnimalDeclaredHistoryDto } from './dto/inputs/register-animal-declared-history.dto';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';
import { UpdateBreedingServiceDto } from './dto/inputs/update-breeding-service.dto';
import { UpdateGestationDiagnosisDto } from './dto/inputs/update-gestation-diagnosis.dto';
import { UpdateParturitionDto } from './dto/inputs/update-parturition.dto';
import { UpdateWeaningDto } from './dto/inputs/update-weaning.dto';
import { UpdateAnimalDeclaredHistoryDto } from './dto/inputs/update-animal-declared-history.dto';

@ApiTags('Cría - Reproducción')
@Controller('breeding')
export class BreedingController {
    constructor(private readonly breedingService: BreedingService) {}

    // ─────────────────────────────────────────────────────────────
    //  FLUJO ONLINE: registrar
    // ─────────────────────────────────────────────────────────────

    @Post('breeding-service')
    @ApiOperation({
        summary: 'Registrar un servicio de monta',
        description: 'Registra un servicio reproductivo (monta natural, inseminación artificial o transferencia de embrión) para una hembra. Crea el evento animal y el registro del servicio en una sola transacción.',
    })
    @ApiCreatedResponse({ description: 'Servicio de monta registrado exitosamente', type: BreedingServiceDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerBreedingService(
        @Body() dto: RegisterBreedingServiceDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.registerBreedingService(dto);
        return CreatedRes(res, { breedingService: result });
    }

    @Post('gestation-diagnosis')
    @ApiOperation({
        summary: 'Registrar un diagnóstico de gestación',
        description: 'Registra el resultado de un diagnóstico de gestación (palpación o ecografía) vinculado a un servicio de monta previo. Solo se permite un diagnóstico por servicio.',
    })
    @ApiCreatedResponse({ description: 'Diagnóstico de gestación registrado exitosamente', type: GestationDiagnosisDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiConflictResponse(SwaggerConflictCommon())
    async registerGestationDiagnosis(
        @Body() dto: RegisterGestationDiagnosisDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.registerGestationDiagnosis(dto);
        return CreatedRes(res, { gestationDiagnosis: result });
    }

    @Post('parturition')
    @ApiOperation({
        summary: 'Registrar un parto',
        description: `Registra el parto de una hembra con diagnóstico de gestación positivo.
        - Si la cría nació viva (criaStatus = "alive"), se crea automáticamente un nuevo animal en el sistema con los datos proporcionados en criaData.
        - La madre queda marcada como hasCalved = true.
        - Solo se permite un parto por diagnóstico de gestación.`,
    })
    @ApiCreatedResponse({ description: 'Parto registrado exitosamente', type: ParturitionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiConflictResponse(SwaggerConflictCommon())
    async registerParturition(
        @Body() dto: RegisterParturitionDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.registerParturition(dto);
        return CreatedRes(res, { parturition: result });
    }

    @Post('weaning')
    @ApiOperation({
        summary: 'Registrar un destete',
        description: 'Registra el destete de una cría. El animal queda marcado como isWeaned = true en el sistema.',
    })
    @ApiCreatedResponse({ description: 'Destete registrado exitosamente', type: WeaningDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerWeaning(
        @Body() dto: RegisterWeaningDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.registerWeaning(dto);
        return CreatedRes(res, { weaning: result });
    }

    @Post('animal-declared-history')
    @ApiOperation({
        summary: 'Registrar el historial reproductivo declarado de un animal',
        description: 'Registra los datos reproductivos previos al ingreso al sistema declarados verbalmente por el productor (partos anteriores, peso promedio al destete, etc.). Solo se permite un historial declarado por animal.',
    })
    @ApiCreatedResponse({ description: 'Historial declarado registrado exitosamente', type: AnimalDeclaredHistoryDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiConflictResponse(SwaggerConflictCommon())
    async registerAnimalDeclaredHistory(
        @Body() dto: RegisterAnimalDeclaredHistoryDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.registerAnimalDeclaredHistory(dto);
        return CreatedRes(res, { history: result });
    }

    // ─────────────────────────────────────────────────────────────
    //  FLUJO ONLINE: actualizar
    // ─────────────────────────────────────────────────────────────

    @Patch('breeding-service/:id')
    @ApiOperation({
        summary: 'Actualizar un servicio de monta',
        description: 'Actualiza los campos editables de un servicio de monta existente (tipo, semen, técnico, lote reproductivo). Solo se actualizan los campos enviados.',
    })
    @ApiParam({ name: 'id', description: 'ID del servicio de monta', example: 1 })
    @ApiOkResponse({ description: 'Servicio de monta actualizado exitosamente', type: BreedingServiceDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateBreedingService(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBreedingServiceDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.updateBreedingService(id, dto);
        return OkRes(res, { breedingService: result });
    }

    @Patch('gestation-diagnosis/:id')
    @ApiOperation({
        summary: 'Actualizar un diagnóstico de gestación',
        description: 'Actualiza los campos editables de un diagnóstico de gestación (método, resultado, días de gestación, fecha estimada de parto, veterinario). Solo se actualizan los campos enviados.',
    })
    @ApiParam({ name: 'id', description: 'ID del diagnóstico de gestación', example: 1 })
    @ApiOkResponse({ description: 'Diagnóstico de gestación actualizado exitosamente', type: GestationDiagnosisDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateGestationDiagnosis(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateGestationDiagnosisDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.updateGestationDiagnosis(id, dto);
        return OkRes(res, { gestationDiagnosis: result });
    }

    @Patch('parturition/:id')
    @ApiOperation({
        summary: 'Actualizar un parto',
        description: 'Actualiza los campos editables de un registro de parto (tipo de nacimiento, peso de cría, estado de cría, condición de la madre). Solo se actualizan los campos enviados.',
    })
    @ApiParam({ name: 'id', description: 'ID del parto', example: 1 })
    @ApiOkResponse({ description: 'Parto actualizado exitosamente', type: ParturitionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateParturition(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateParturitionDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.updateParturition(id, dto);
        return OkRes(res, { parturition: result });
    }

    @Patch('weaning/:id')
    @ApiOperation({
        summary: 'Actualizar un destete',
        description: 'Actualiza los campos editables de un registro de destete (peso al destete, edad en días). Solo se actualizan los campos enviados.',
    })
    @ApiParam({ name: 'id', description: 'ID del destete', example: 1 })
    @ApiOkResponse({ description: 'Destete actualizado exitosamente', type: WeaningDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateWeaning(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWeaningDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.updateWeaning(id, dto);
        return OkRes(res, { weaning: result });
    }

    @Patch('animal-declared-history/:id')
    @ApiOperation({
        summary: 'Actualizar el historial reproductivo declarado',
        description: 'Actualiza los campos editables del historial reproductivo declarado de un animal. Solo se actualizan los campos enviados.',
    })
    @ApiParam({ name: 'id', description: 'ID del historial declarado', example: 1 })
    @ApiOkResponse({ description: 'Historial declarado actualizado exitosamente', type: AnimalDeclaredHistoryDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateAnimalDeclaredHistory(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAnimalDeclaredHistoryDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.updateAnimalDeclaredHistory(id, dto);
        return OkRes(res, { history: result });
    }

    // ─────────────────────────────────────────────────────────────
    //  FLUJO ONLINE: eliminar
    // ─────────────────────────────────────────────────────────────

    @Delete('breeding-service/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un servicio de monta',
        description: 'Elimina un servicio de monta y todos sus registros dependientes en cascada: diagnóstico de gestación → parto. También elimina los eventos animales asociados a cada nivel eliminado.',
    })
    @ApiParam({ name: 'id', description: 'ID del servicio de monta', example: 1 })
    @ApiNoContentResponse({ description: 'Servicio de monta eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteBreedingService(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.breedingService.deleteBreedingService(id);
    }

    @Delete('gestation-diagnosis/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un diagnóstico de gestación',
        description: 'Elimina un diagnóstico de gestación y su parto dependiente (si existe). También elimina los eventos animales asociados.',
    })
    @ApiParam({ name: 'id', description: 'ID del diagnóstico de gestación', example: 1 })
    @ApiNoContentResponse({ description: 'Diagnóstico de gestación eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteGestationDiagnosis(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.breedingService.deleteGestationDiagnosis(id);
    }

    @Delete('parturition/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un parto',
        description: 'Elimina un registro de parto y su evento animal asociado.',
    })
    @ApiParam({ name: 'id', description: 'ID del parto', example: 1 })
    @ApiNoContentResponse({ description: 'Parto eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteParturition(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.breedingService.deleteParturition(id);
    }

    @Delete('weaning/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un destete',
        description: 'Elimina un registro de destete, su evento animal asociado y revierte el marcado de destete del animal (isWeaned → null).',
    })
    @ApiParam({ name: 'id', description: 'ID del destete', example: 1 })
    @ApiNoContentResponse({ description: 'Destete eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteWeaning(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.breedingService.deleteWeaning(id);
    }

    @Delete('animal-declared-history/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar el historial reproductivo declarado',
        description: 'Elimina el historial reproductivo declarado de un animal.',
    })
    @ApiParam({ name: 'id', description: 'ID del historial declarado', example: 1 })
    @ApiNoContentResponse({ description: 'Historial declarado eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteAnimalDeclaredHistory(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.breedingService.deleteAnimalDeclaredHistory(id);
    }

    // ─────────────────────────────────────────────────────────────
    //  FLUJO OFFLINE: sincronización batch desde app móvil
    // ─────────────────────────────────────────────────────────────

    @Post('sync')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sincronizar eventos reproductivos registrados offline',
        description: `Recibe un batch de operaciones reproductivas registradas sin conexión en la app móvil y las procesa en orden cronológico.

**Comportamiento:**
- Cada operación se ejecuta en su propia transacción.
- Si una operación falla, las demás continúan procesándose (no aborta el batch completo).
- El servidor responde con el resultado de cada operación (success/failed) y el ID asignado.

**Operaciones soportadas:** \`create\` · \`update\` · \`delete\`

**Referencias cruzadas (localRef_):**
Para registros creados en el mismo batch (aún sin ID del servidor), usar \`localRef_<campo>\` en el payload \`data\`:
\`\`\`json
{ "localRef_idService": "uuid-device-001" }
\`\`\`
El servidor sustituirá el valor por el ID real asignado al crear ese registro.

**Para \`update\` y \`delete\`:** proporcionar \`serverId\` con el ID del servidor del registro a modificar/eliminar.
En operaciones \`update\`, el campo \`data\` contiene solo los campos a actualizar.
En operaciones \`delete\`, el campo \`data\` puede estar vacío.

**Tipos soportados:** breeding_service · gestation_diagnosis · parturition · weaning · animal_declared_history`,
    })
    @ApiOkResponse({ description: 'Batch procesado. Ver resultados individuales para éxitos y errores.', type: SyncBreedingResponseDto })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async syncBatch(
        @Body() dto: SyncBreedingDto,
        @Res() res: express.Response,
    ) {
        const result = await this.breedingService.syncBatch(dto);
        return OkRes(res, result);
    }
}
