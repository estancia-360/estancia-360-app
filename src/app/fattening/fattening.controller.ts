import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import * as express from 'express';
import { CreatedRes, OkRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { FatteningService } from './fattening.service';
import { RegisterFatteningEntryDto } from './dto/inputs/register-fattening-entry.dto';
import { UpdateFatteningEntryDto } from './dto/inputs/update-fattening-entry.dto';
import { RegisterFeedRecordDto } from './dto/inputs/register-feed-record.dto';
import { UpdateFeedRecordDto } from './dto/inputs/update-feed-record.dto';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';

@ApiTags('Engorde')
@Controller('fattening')
export class FatteningController {
    constructor(private readonly fatteningService: FatteningService) {}

    // ─────────────────────────────────────────────────────────────
    //  INGRESO A ENGORDE
    // ─────────────────────────────────────────────────────────────

    @Post('entry')
    @ApiOperation({
        summary: 'Registrar ingreso manual a engorde',
        description: `Ingresa un animal directamente a Engorde (ps=2→3). Úsalo cuando el operador registra el ingreso de forma directa (no desde la selección de recría).

**RN-09:** El animal debe estar en Recría (ps=2).
El sistema actualiza automáticamente: \`ranch_animals.id_productive_status = 3\` y \`ranch_animals.id_lot = idLotDest\`.`,
    })
    @ApiCreatedResponse({ description: 'Ingreso a engorde registrado exitosamente', type: FatteningEntryDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerFatteningEntry(
        @Body() dto: RegisterFatteningEntryDto,
        @Res() res: express.Response,
    ) {
        const result = await this.fatteningService.registerFatteningEntry(dto);
        return CreatedRes(res, { fatteningEntry: result });
    }

    @Patch('entry/:id')
    @ApiOperation({
        summary: 'Actualizar un ingreso a engorde',
        description: 'Actualiza el sistema de engorde (field/feedlot) o el peso inicial del registro.',
    })
    @ApiParam({ name: 'id', description: 'ID del registro de ingreso a engorde', example: 1 })
    @ApiOkResponse({ description: 'Ingreso a engorde actualizado exitosamente', type: FatteningEntryDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateFatteningEntry(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateFatteningEntryDto,
        @Res() res: express.Response,
    ) {
        const result = await this.fatteningService.updateFatteningEntry(id, dto);
        return OkRes(res, { fatteningEntry: result });
    }

    @Delete('entry/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un ingreso a engorde',
        description: 'Elimina el registro de ingreso a engorde y revierte el animal a ps=2 (Recría). El lote queda en null.',
    })
    @ApiParam({ name: 'id', description: 'ID del registro de ingreso a engorde', example: 1 })
    @ApiNoContentResponse({ description: 'Ingreso a engorde eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteFatteningEntry(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.fatteningService.deleteFatteningEntry(id);
    }

    // ─────────────────────────────────────────────────────────────
    //  ALIMENTACIÓN (FEED RECORDS)
    // ─────────────────────────────────────────────────────────────

    @Post('feed-record')
    @ApiOperation({
        summary: 'Registrar alimentación de un lote',
        description: `Registra el suministro de alimento para un lote completo.

**Nota:** Este es el único registro del sistema que no genera un \`animal_event\` — la alimentación se gestiona por lote, no por animal individual.

El \`feedType\` es texto libre: maíz, balanceado, heno, silaje, etc.
La \`unit\` es opcional — si no se envía se asume kg por defecto.`,
    })
    @ApiCreatedResponse({ description: 'Registro de alimentación creado exitosamente', type: FeedRecordDto })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerFeedRecord(
        @Body() dto: RegisterFeedRecordDto,
        @Res() res: express.Response,
    ) {
        const result = await this.fatteningService.registerFeedRecord(dto);
        return CreatedRes(res, { feedRecord: result });
    }

    @Patch('feed-record/:id')
    @ApiOperation({
        summary: 'Actualizar un registro de alimentación',
        description: 'Actualiza tipo de alimento, cantidad, unidad, costo o notas.',
    })
    @ApiParam({ name: 'id', description: 'ID del registro de alimentación', example: 1 })
    @ApiOkResponse({ description: 'Registro de alimentación actualizado exitosamente', type: FeedRecordDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateFeedRecord(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateFeedRecordDto,
        @Res() res: express.Response,
    ) {
        const result = await this.fatteningService.updateFeedRecord(id, dto);
        return OkRes(res, { feedRecord: result });
    }

    @Delete('feed-record/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un registro de alimentación' })
    @ApiParam({ name: 'id', description: 'ID del registro de alimentación', example: 1 })
    @ApiNoContentResponse({ description: 'Registro de alimentación eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteFeedRecord(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.fatteningService.deleteFeedRecord(id);
    }
}
