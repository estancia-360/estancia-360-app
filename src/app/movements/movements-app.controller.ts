import { Body, Controller, Param, ParseIntPipe, Patch, Post, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import * as express from 'express';
import { CreatedRes, OkRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { MovementsAppService } from './movements-app.service';
import { RegisterMovementDto } from './dto/inputs/register-movement.dto';
import { ConfirmMovementAnimalDto } from './dto/inputs/confirm-movement-animal.dto';
import { RegisterAnimalExitDto } from './dto/inputs/register-animal-exit.dto';
import { UpdateAnimalExitDto } from './dto/inputs/update-animal-exit.dto';
import { MovementDto } from 'src/modules/movement-modules/movements/dto/movement.dto';
import { AnimalExitDto } from 'src/modules/movement-modules/animal-exits/dto/animal-exit.dto';

@ApiTags('Movimientos')
@Controller('movements')
export class MovementsAppController {
    constructor(private readonly movementsAppService: MovementsAppService) {}

    // ─────────────────────────────────────────────────────────────
    //  REGISTRO DE MOVIMIENTOS
    // ─────────────────────────────────────────────────────────────

    @Post('register')
    @ApiOperation({
        summary: 'Registrar un movimiento batch (venta, compra, traslado o salida a otra estancia)',
        description: `Registra una operación de movimiento sobre uno o más animales. La rama de lógica depende de \`movementType\`:

| Tipo | Estado resultante | Efecto sobre los animales |
|---|---|---|
| \`pasture_transfer\` | confirmed directo | \`id_lot = idLotDest\` (el estado del animal NO cambia). Evento tipo 9 por animal. |
| \`purchase\` | confirmed directo | Crea \`ranch_animals\` nuevos con \`origin='purchased'\`. Evento tipo 7 por animal. Solo OWNER. |
| \`sale\` | **pending** | Animales pasan a \`id_status=4\` (Pendiente de Movimiento). SIN evento hasta confirmar. Solo OWNER. |
| \`ranch_exit\` | confirmed directo | \`id_status=5\` (Vendido) + \`ps=4\` (Baja) — IRREVERSIBLE. Evento tipo 10 por animal. Solo OWNER. |

**Validaciones:** animal debe pertenecer a la estancia, no estar en baja (RN-02/RN-07), no estar en otro movimiento pendiente. Para \`sale\`: ningún animal puede tener retiro sanitario activo (RN-18). Para \`purchase\`: el código caravana debe ser único (RN-03).

**Idempotencia:** enviar \`localId\` — si ya fue procesado, devuelve el movimiento existente sin duplicar.`,
    })
    @ApiCreatedResponse({ description: 'Movimiento registrado', type: MovementDto })
    @ApiForbiddenResponse({ description: 'Solo el Dueño puede registrar sale/purchase/ranch_exit (RN-01/RN-16)' })
    @ApiConflictResponse({ description: 'Animal en otro movimiento pendiente, con retiro activo (RN-18), o código duplicado (RN-03)' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerMovement(
        @Body() dto: RegisterMovementDto,
        @Res() res: express.Response,
    ) {
        const result = await this.movementsAppService.registerMovement(dto);
        return CreatedRes(res, { movement: result });
    }

    @Patch('animal/:idMovementAnimal/confirm')
    @ApiOperation({
        summary: 'Confirmar o rechazar UN animal de una venta pendiente',
        description: `Aplica la decisión del comprador sobre un animal individual de una venta (\`sale\`) en estado pending.

**Máquina de estados (validada contra la DB, no contra lo que crea el cliente):**
- \`pending → accepted\`: animal vendido definitivo (\`id_status=5\`, \`ps=4\`), se crea el evento tipo 8. IRREVERSIBLE.
- \`pending → rejected\`: animal revierte a su \`prev_id_status\`, queda disponible. No genera evento.
- Repetir la misma decisión ya aplicada → responde éxito sin efecto (idempotente, seguro ante reintentos).
- Decisión contraria a una ya aplicada → **409 INVALID_STATUS_TRANSITION**.
- Movimiento cancelado → **409 MOVEMENT_CANCELLED**.

Cuando no quedan animales pending, el movimiento pasa automáticamente a \`confirmed\`.`,
    })
    @ApiParam({ name: 'idMovementAnimal', description: 'ID del detalle animal (movement_animals)', example: 1 })
    @ApiOkResponse({ description: 'Movimiento actualizado con el detalle por animal', type: MovementDto })
    @ApiConflictResponse({ description: 'Transición de estado inválida o movimiento cancelado' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async confirmMovementAnimal(
        @Param('idMovementAnimal', ParseIntPipe) idMovementAnimal: number,
        @Body() dto: ConfirmMovementAnimalDto,
        @Res() res: express.Response,
    ) {
        const result = await this.movementsAppService.confirmMovementAnimal(idMovementAnimal, dto);
        return OkRes(res, { movement: result });
    }

    @Patch(':idMovement/cancel')
    @ApiOperation({
        summary: 'Cancelar un movimiento pendiente (venta)',
        description: `Cancela un movimiento en estado pending. Todos los animales que sigan en \`pending\` revierten a su \`prev_id_status\`.

- Los animales ya \`accepted\` (vendidos) NO se revierten — la venta confirmada es irreversible (RN-07).
- Cancelar un movimiento ya cancelado → éxito sin efecto (idempotente).
- Cancelar un movimiento ya \`confirmed\` → **409 MOVEMENT_ALREADY_CONFIRMED**.`,
    })
    @ApiParam({ name: 'idMovement', description: 'ID del movimiento', example: 1 })
    @ApiOkResponse({ description: 'Movimiento cancelado', type: MovementDto })
    @ApiConflictResponse({ description: 'El movimiento ya está confirmado' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async cancelMovement(
        @Param('idMovement', ParseIntPipe) idMovement: number,
        @Res() res: express.Response,
    ) {
        const result = await this.movementsAppService.cancelMovement(idMovement);
        return OkRes(res, { movement: result });
    }

    // ─────────────────────────────────────────────────────────────
    //  BAJAS (muerte / descarte / pérdida)
    // ─────────────────────────────────────────────────────────────

    @Post('animal-exit')
    @ApiOperation({
        summary: 'Registrar la baja de un animal (muerte, descarte, pérdida)',
        description: `Registra la salida definitiva NO comercial de un animal. El animal pasa a \`ps=4\` (Baja) + \`id_status=3\` (Inactivo) — **IRREVERSIBLE** (RN-07/RN-10). No existe endpoint de eliminación: la baja no puede deshacerse.

- \`reason='other'\` requiere \`notes\` obligatorio.
- Un animal en un movimiento pendiente no puede darse de baja hasta resolver ese movimiento.
- Concepto distinto a venta: la mortalidad va acá, nunca en Sanidad ni como sale.`,
    })
    @ApiCreatedResponse({ description: 'Baja registrada', type: AnimalExitDto })
    @ApiConflictResponse({ description: 'El animal está en un movimiento pendiente' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerAnimalExit(
        @Body() dto: RegisterAnimalExitDto,
        @Res() res: express.Response,
    ) {
        const result = await this.movementsAppService.registerAnimalExit(dto);
        return CreatedRes(res, { animalExit: result });
    }

    @Patch('animal-exit/:id')
    @ApiOperation({
        summary: 'Corregir causa o notas de una baja',
        description: 'Solo permite editar `reason` y `notes` (corrección de datos). El estado del animal NO cambia — la baja es irreversible.',
    })
    @ApiParam({ name: 'id', description: 'ID de la baja', example: 1 })
    @ApiOkResponse({ description: 'Baja actualizada', type: AnimalExitDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async updateAnimalExit(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAnimalExitDto,
        @Res() res: express.Response,
    ) {
        const result = await this.movementsAppService.updateAnimalExit(id, dto);
        return OkRes(res, { animalExit: result });
    }
}
