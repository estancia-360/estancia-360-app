import { Injectable } from '@nestjs/common';
import { SyncCriaDto } from './dto/inputs/sync-cria.dto';
import { SyncCriaResponseDto } from './dto/outputs/sync-cria-response.dto';
import { SyncCriaBatchUseCase } from './use-cases/sync-cria-batch.use-case';
import { SyncRecriaDto } from './dto/inputs/sync-recria.dto';
import { SyncRecriaResponseDto } from './dto/outputs/sync-recria-response.dto';
import { SyncRecriaBatchUseCase } from './use-cases/sync-recria-batch.use-case';
import { SyncEngordeDto } from './dto/inputs/sync-engorde.dto';
import { SyncEngordeResponseDto } from './dto/outputs/sync-engorde-response.dto';
import { SyncEngordeBatchUseCase } from './use-cases/sync-engorde-batch.use-case';
import { SyncSanidadDto } from './dto/inputs/sync-sanidad.dto';
import { SyncSanidadResponseDto } from './dto/outputs/sync-sanidad-response.dto';
import { SyncSanidadBatchUseCase } from './use-cases/sync-sanidad-batch.use-case';
import { SyncMovimientosDto } from './dto/inputs/sync-movimientos.dto';
import { SyncMovimientosResponseDto } from './dto/outputs/sync-movimientos-response.dto';
import { SyncMovimientosBatchUseCase } from './use-cases/sync-movimientos-batch.use-case';

@Injectable()
export class SyncService {
    constructor(
        private readonly syncCriaBatchUseCase: SyncCriaBatchUseCase,
        private readonly syncRecriaBatchUseCase: SyncRecriaBatchUseCase,
        private readonly syncEngordeBatchUseCase: SyncEngordeBatchUseCase,
        private readonly syncSanidadBatchUseCase: SyncSanidadBatchUseCase,
        private readonly syncMovimientosBatchUseCase: SyncMovimientosBatchUseCase,
    ) {}

    async syncCria(dto: SyncCriaDto, idUser: number): Promise<SyncCriaResponseDto> {
        return this.syncCriaBatchUseCase.execute(dto, idUser);
    }

    async syncRecria(dto: SyncRecriaDto, idUser: number): Promise<SyncRecriaResponseDto> {
        return this.syncRecriaBatchUseCase.execute(dto, idUser);
    }

    async syncEngorde(dto: SyncEngordeDto, idUser: number): Promise<SyncEngordeResponseDto> {
        return this.syncEngordeBatchUseCase.execute(dto, idUser);
    }

    async syncSanidad(dto: SyncSanidadDto, idUser: number): Promise<SyncSanidadResponseDto> {
        return this.syncSanidadBatchUseCase.execute(dto, idUser);
    }

    async syncMovimientos(dto: SyncMovimientosDto, idUser: number): Promise<SyncMovimientosResponseDto> {
        return this.syncMovimientosBatchUseCase.execute(dto, idUser);
    }
}
