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
import { RearingService } from './rearing.service';
import { RegisterWeightRecordDto } from './dto/inputs/register-weight-record.dto';
import { UpdateWeightRecordDto } from './dto/inputs/update-weight-record.dto';
import { RegisterRearingSelectionDto } from './dto/inputs/register-rearing-selection.dto';
import { UpdateRearingSelectionDto } from './dto/inputs/update-rearing-selection.dto';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';

@ApiTags('Recría')
@Controller('rearing')
export class RearingController {
    constructor(private readonly rearingService: RearingService) {}

    // ─────────────────────────────────────────────────────────────
    //  PESAJES
    // ─────────────────────────────────────────────────────────────

    @Post('weight-record')
    @ApiOperation({
        summary: 'Registrar un pesaje',
        description: `Registra el peso de un animal. El nuevo peso queda guardado en ranch_animals.weight.

**GMD (Ganancia Media Diaria):** No se almacena. Para calcularlo, obtener los pesajes del animal ordenados por fecha y aplicar:
\`\`\`
GMD = (peso_actual - peso_anterior) / días_entre_pesajes
\`\`\`
Usar \`GET /weight-records/animal/:id\` que retorna los pesajes en orden cronológico.`,
    })
    @ApiCreatedResponse({ description: 'Pesaje registrado exitosamente', type: WeightRecordDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerWeightRecord(
        @Body() dto: RegisterWeightRecordDto,
        @Res() res: express.Response,
    ) {
        const result = await this.rearingService.registerWeightRecord(dto);
        return CreatedRes(res, { weightRecord: result });
    }

    @Patch('weight-record/:id')
    @ApiOperation({
        summary: 'Actualizar un pesaje',
        description: 'Actualiza los campos editables de un pesaje (peso, tipo, condición corporal, edad en días, notas). Solo se actualizan los campos enviados.',
    })
    @ApiParam({ name: 'id', description: 'ID del registro de peso', example: 1 })
    @ApiOkResponse({ description: 'Pesaje actualizado exitosamente', type: WeightRecordDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateWeightRecord(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWeightRecordDto,
        @Res() res: express.Response,
    ) {
        const result = await this.rearingService.updateWeightRecord(id, dto);
        return OkRes(res, { weightRecord: result });
    }

    @Delete('weight-record/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un pesaje',
        description: 'Elimina un registro de peso y su evento animal asociado.',
    })
    @ApiParam({ name: 'id', description: 'ID del registro de peso', example: 1 })
    @ApiNoContentResponse({ description: 'Pesaje eliminado exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteWeightRecord(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.rearingService.deleteWeightRecord(id);
    }

    // ─────────────────────────────────────────────────────────────
    //  SELECCIÓN DE RECRÍA
    // ─────────────────────────────────────────────────────────────

    @Post('rearing-selection')
    @ApiOperation({
        summary: 'Registrar la selección de recría de un animal',
        description: `Registra la decisión de destino para un animal en Recría (ps=2).

**Destinos posibles:**
- **replacement** — El animal se queda como vientre reproductor. Permanece en Recría (ps=2).
- **fattening** — El animal pasa a Engorde (ps→3). Se crea automáticamente un registro \`fattening_entry\`. Requiere \`idLotDest\` y \`systemType\`.
- **sale** — El animal se destina a venta/baja. ps→4, status→3 (IRREVERSIBLE).

**RN-09:** Destino \`fattening\` solo aplica si el animal está en ps=2 (Recría).`,
    })
    @ApiCreatedResponse({ description: 'Selección registrada exitosamente', type: RearingSelectionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerRearingSelection(
        @Body() dto: RegisterRearingSelectionDto,
        @Res() res: express.Response,
    ) {
        const result = await this.rearingService.registerRearingSelection(dto);
        return CreatedRes(res, { rearingSelection: result });
    }

    @Patch('rearing-selection/:id')
    @ApiOperation({
        summary: 'Actualizar una selección de recría',
        description: 'Actualiza campos editables de la selección (peso, condición corporal, score genético). El destino no se puede cambiar post-registro.',
    })
    @ApiParam({ name: 'id', description: 'ID de la selección', example: 1 })
    @ApiOkResponse({ description: 'Selección actualizada exitosamente', type: RearingSelectionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateRearingSelection(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRearingSelectionDto,
        @Res() res: express.Response,
    ) {
        const result = await this.rearingService.updateRearingSelection(id, dto);
        return OkRes(res, { rearingSelection: result });
    }

    @Delete('rearing-selection/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar una selección de recría',
        description: `Elimina la selección y revierte el estado del animal si aplica.
- Si el destino era \`fattening\`: elimina el fattening_entry asociado y vuelve el animal a ps=2.
- Si el destino era \`sale\`: la baja NO se revierte (irreversible — RN-07).`,
    })
    @ApiParam({ name: 'id', description: 'ID de la selección', example: 1 })
    @ApiNoContentResponse({ description: 'Selección eliminada exitosamente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async deleteRearingSelection(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.rearingService.deleteRearingSelection(id);
    }
}
