import { Injectable } from '@nestjs/common';
import { SyncCriaDto } from './dto/inputs/sync-cria.dto';
import { SyncCriaResponseDto } from './dto/outputs/sync-cria-response.dto';
import { SyncCriaBatchUseCase } from './use-cases/sync-cria-batch.use-case';
import { SyncRecriaDto } from './dto/inputs/sync-recria.dto';
import { SyncRecriaResponseDto } from './dto/outputs/sync-recria-response.dto';
import { SyncRecriaBatchUseCase } from './use-cases/sync-recria-batch.use-case';

@Injectable()
export class SyncService {
    constructor(
        private readonly syncCriaBatchUseCase: SyncCriaBatchUseCase,
        private readonly syncRecriaBatchUseCase: SyncRecriaBatchUseCase,
    ) { }

    async syncCria(dto: SyncCriaDto): Promise<SyncCriaResponseDto> {
        return this.syncCriaBatchUseCase.execute(dto);
    }

    async syncRecria(dto: SyncRecriaDto): Promise<SyncRecriaResponseDto> {
        return this.syncRecriaBatchUseCase.execute(dto);
    }
}
