import { Injectable } from '@nestjs/common';
import { SyncCriaDto } from './dto/inputs/sync-cria.dto';
import { SyncCriaResponseDto } from './dto/outputs/sync-cria-response.dto';
import { SyncCriaBatchUseCase } from './use-cases/sync-cria-batch.use-case';

@Injectable()
export class SyncService {
    constructor(
        private readonly syncCriaBatchUseCase: SyncCriaBatchUseCase,
    ) { }

    /**
     * Ejecuta la sincronización batch del módulo de CRÍA.
     * Delega toda la lógica al use-case correspondiente.
     */
    async syncCria(dto: SyncCriaDto): Promise<SyncCriaResponseDto> {
        return this.syncCriaBatchUseCase.execute(dto);
    }
}
