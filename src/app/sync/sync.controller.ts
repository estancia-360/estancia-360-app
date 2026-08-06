import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/shared/decorators';
import { SyncService } from './sync.service';
import { SyncDownloadService } from './services/sync-download.service';
import { SyncCriaDto } from './dto/inputs/sync-cria.dto';
import { SyncCriaResponseDto } from './dto/outputs/sync-cria-response.dto';
import { SyncRecriaDto } from './dto/inputs/sync-recria.dto';
import { SyncRecriaResponseDto } from './dto/outputs/sync-recria-response.dto';
import { SyncEngordeDto } from './dto/inputs/sync-engorde.dto';
import { SyncEngordeResponseDto } from './dto/outputs/sync-engorde-response.dto';
import { SyncSanidadDto } from './dto/inputs/sync-sanidad.dto';
import { SyncSanidadResponseDto } from './dto/outputs/sync-sanidad-response.dto';
import { SyncMovimientosDto } from './dto/inputs/sync-movimientos.dto';
import { SyncMovimientosResponseDto } from './dto/outputs/sync-movimientos-response.dto';
import { SyncDownloadQueryDto } from './dto/inputs/sync-download-query.dto';
import { SyncRanchDto } from './dto/outputs/sync-ranches-response.dto';
import { SyncCatalogsResponseDto } from './dto/outputs/sync-catalogs-response.dto';
import { SyncDownloadResponseDto } from './dto/outputs/sync-download-response.dto';

@ApiTags('Offline Sync')
@ApiBearerAuth('access-token')
@Controller('sync')
export class SyncController {
    constructor(
        private readonly syncService: SyncService,
        private readonly syncDownloadService: SyncDownloadService,
    ) {}

    @Get('ranches')
    @UserUp()
    @ApiOperation({ summary: 'List ranches the authenticated user can access [MOBILE]', description: 'First step of the sync flow: the client uses the idRanch values returned here to call GET /sync/download/:idRanch.' })
    @ApiOkResponse({ type: [SyncRanchDto] })
    async getRanches(@CurrentUser('id') idUser: number): Promise<{ ranches: SyncRanchDto[] }> {
        return { ranches: await this.syncDownloadService.getRanchesForUser(idUser) };
    }

    @Get('catalogs')
    @UserUp()
    @ApiOperation({ summary: 'Download system catalogs [MOBILE]', description: 'Small static tables (animal classes, breeds, statuses, event types, productive statuses, production types). Downloaded whole, no pagination/since — use on bootstrap or when the local copy looks stale.' })
    @ApiOkResponse({ type: SyncCatalogsResponseDto })
    async getCatalogs(): Promise<SyncCatalogsResponseDto> {
        return await this.syncDownloadService.getCatalogs();
    }

    @Get('download/:idRanch')
    @UserUp()
    @ApiOperation({
        summary: 'Download ranch data — bootstrap or incremental [MOBILE]',
        description: `Unified download endpoint for every module (Cría, Recría, Engorde, Sanidad, Movimientos).

Omit \`since\` for a full bootstrap. Pass \`since=<serverTime from the last download>\` for an incremental sync. If \`nextCursor\` comes back non-null, repeat the call with \`cursor=<nextCursor>\` (same \`since\`) until it's null. \`deletions\` groups tombstoned IDs by table since \`since\`. Save \`serverTime\` once \`nextCursor\` is null and use it as the next \`since\`.`,
    })
    @ApiOkResponse({ type: SyncDownloadResponseDto })
    async download(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() query: SyncDownloadQueryDto,
        @CurrentUser('id') idUser: number,
    ): Promise<SyncDownloadResponseDto> {
        await this.syncDownloadService.assertRanchAccess(idUser, idRanch);
        const since = query.since ? new Date(query.since) : undefined;
        return await this.syncDownloadService.download(idRanch, since, query.cursor, query.limit);
    }

    @Post('cria')
    @UserUp()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sync offline data for the Cría module [MOBILE]',
        description: 'Batch of operations recorded offline. Order: ranchPastures → ranchLots → ranchAnimals → breedingServices → gestationDiagnoses → parturitions → weanings → animalDeclaredHistories. Each operation fails independently — one failure does not abort the batch. Use localRef_<field> to reference records created earlier in the same batch.',
    })
    @ApiOkResponse({ type: SyncCriaResponseDto })
    async syncCria(@Body() dto: SyncCriaDto, @CurrentUser('id') idUser: number): Promise<SyncCriaResponseDto> {
        await this.syncDownloadService.assertRanchAccess(idUser, dto.idRanch);
        return await this.syncService.syncCria(dto, idUser);
    }

    @Post('recria')
    @UserUp()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sync offline data for the Recría module [MOBILE]',
        description: 'Order: weightRecords → rearingSelections.',
    })
    @ApiOkResponse({ type: SyncRecriaResponseDto })
    async syncRecria(@Body() dto: SyncRecriaDto, @CurrentUser('id') idUser: number): Promise<SyncRecriaResponseDto> {
        await this.syncDownloadService.assertRanchAccess(idUser, dto.idRanch);
        return await this.syncService.syncRecria(dto, idUser);
    }

    @Post('engorde')
    @UserUp()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sync offline data for the Engorde module [MOBILE]',
        description: 'Order: weightRecords → feedRecords.',
    })
    @ApiOkResponse({ type: SyncEngordeResponseDto })
    async syncEngorde(@Body() dto: SyncEngordeDto, @CurrentUser('id') idUser: number): Promise<SyncEngordeResponseDto> {
        await this.syncDownloadService.assertRanchAccess(idUser, dto.idRanch);
        return await this.syncService.syncEngorde(dto, idUser);
    }

    @Post('sanidad')
    @UserUp()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sync offline data for the Sanidad module [MOBILE]',
        description: 'Order: vaccinations → treatments → healthIncidents. Applies at any productive stage, regardless of the ranch\'s enabled rubros.',
    })
    @ApiOkResponse({ type: SyncSanidadResponseDto })
    async syncSanidad(@Body() dto: SyncSanidadDto, @CurrentUser('id') idUser: number): Promise<SyncSanidadResponseDto> {
        await this.syncDownloadService.assertRanchAccess(idUser, dto.idRanch);
        return await this.syncService.syncSanidad(dto, idUser);
    }

    @Post('movimientos')
    @UserUp()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sync offline data for the Movimientos module [MOBILE]',
        description: 'Order: animalExits → movements → movementAnimals. The movementAnimals section of the response includes the localId→serverId mapping of animals nested inside each created movement — save those IDs to confirm/reject in later syncs.',
    })
    @ApiOkResponse({ type: SyncMovimientosResponseDto })
    async syncMovimientos(@Body() dto: SyncMovimientosDto, @CurrentUser('id') idUser: number): Promise<SyncMovimientosResponseDto> {
        await this.syncDownloadService.assertRanchAccess(idUser, dto.idRanch);
        return await this.syncService.syncMovimientos(dto, idUser);
    }
}
