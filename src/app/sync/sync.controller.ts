import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerBadRequestCommon } from 'src/shared/utils';
import { SyncService } from './sync.service';
import { SyncCriaDto } from './dto/inputs/sync-cria.dto';
import { SyncCriaResponseDto } from './dto/outputs/sync-cria-response.dto';

@ApiTags('Sincronización Offline')
@Controller('sync')
export class SyncController {
    constructor(private readonly syncService: SyncService) { }

    // ─────────────────────────────────────────────────────────────────────────
    //  POST /sync/cria
    // ─────────────────────────────────────────────────────────────────────────

    @Post('cria')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sincronizar datos offline del módulo de CRÍA',
        description: `Recibe un batch de operaciones creadas sin conexión en la app móvil y las procesa en el servidor.

**Orden de procesamiento (garantizado):**
1. \`ranchPastures\` — Potreros (sin dependencias externas)
2. \`ranchLots\`     — Lotes (pueden referenciar potreros del mismo batch)
3. \`ranchAnimals\`  — Animales (pueden referenciar lotes del mismo batch)
4. \`breedingEvents\`— Eventos de cría (pueden referenciar animales del mismo batch)

**Comportamiento por operación:**
- \`create\`: Crea el registro. Si ya existía (mismo \`localId\`), devuelve el ID existente sin crear duplicado.
- \`update\`: Modifica solo los campos enviados. Requiere \`serverId\`.
- \`delete\`: Elimina o inactiva el registro. Requiere \`serverId\`.

**Fallos independientes:** Si una operación falla, las demás continúan procesándose. El batch nunca se aborta completo.

**Referencias cruzadas dentro del batch:**
Para referenciar un registro creado en el mismo batch (aún sin \`serverId\`), usar \`localRef_<campo>\` en \`data\`:
\`\`\`json
{ "localRef_idRanchPasture": "uuid-potrero-local-1" }
\`\`\`
El servidor sustituirá ese valor por el \`serverId\` real asignado al procesar ese registro.

**Tipos de evento soportados en breedingEvents:**
\`breeding_service\` · \`gestation_diagnosis\` · \`parturition\` · \`weaning\` · \`animal_declared_history\``,
    })
    @ApiOkResponse({
        description:
            'Batch procesado. Revisar cada sección para ver éxitos, errores y serverIds asignados.',
        type: SyncCriaResponseDto,
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async syncCria(
        @Body() dto: SyncCriaDto,
        @Res() res: express.Response,
    ) {
        const result = await this.syncService.syncCria(dto);
        return OkRes(res, result);
    }
}
