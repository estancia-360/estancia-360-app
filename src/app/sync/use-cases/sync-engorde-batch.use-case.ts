import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SyncEngordeDto, SyncWeightRecordEngordeOperationDto, SyncFeedRecordOperationDto } from '../dto/inputs/sync-engorde.dto';
import { SyncEngordeResponseDto } from '../dto/outputs/sync-engorde-response.dto';
import { SyncCriaSectionDto, SyncCriaOperationResultDto } from '../dto/outputs/sync-cria-response.dto';
import { RegisterWeightRecordUseCase } from 'src/app/rearing/use-cases/register-weight-record.use-case';
import { UpdateWeightRecordUseCase } from 'src/app/rearing/use-cases/update-weight-record.use-case';
import { DeleteWeightRecordUseCase } from 'src/app/rearing/use-cases/delete-weight-record.use-case';
import { RegisterFeedRecordUseCase } from 'src/app/fattening/use-cases/register-feed-record.use-case';
import { UpdateFeedRecordUseCase } from 'src/app/fattening/use-cases/update-feed-record.use-case';
import { DeleteFeedRecordUseCase } from 'src/app/fattening/use-cases/delete-feed-record.use-case';
import { RegisterWeightRecordDto } from 'src/app/rearing/dto/inputs/register-weight-record.dto';
import { UpdateWeightRecordDto } from 'src/app/rearing/dto/inputs/update-weight-record.dto';
import { RegisterFeedRecordDto } from 'src/app/fattening/dto/inputs/register-feed-record.dto';
import { UpdateFeedRecordDto } from 'src/app/fattening/dto/inputs/update-feed-record.dto';

@Injectable()
export class SyncEngordeBatchUseCase {
    private readonly logger = new Logger(SyncEngordeBatchUseCase.name);

    constructor(
        private readonly registerWeightRecordUseCase: RegisterWeightRecordUseCase,
        private readonly updateWeightRecordUseCase: UpdateWeightRecordUseCase,
        private readonly deleteWeightRecordUseCase: DeleteWeightRecordUseCase,
        private readonly registerFeedRecordUseCase: RegisterFeedRecordUseCase,
        private readonly updateFeedRecordUseCase: UpdateFeedRecordUseCase,
        private readonly deleteFeedRecordUseCase: DeleteFeedRecordUseCase,
    ) {}

    async execute(dto: SyncEngordeDto): Promise<SyncEngordeResponseDto> {
        const localIdToServerId = new Map<string, number>();

        const weightRecordsSection = await this.processWeightRecords(
            dto.weightRecords ?? [],
            localIdToServerId,
        );

        const feedRecordsSection = await this.processFeedRecords(
            dto.feedRecords ?? [],
            localIdToServerId,
        );

        return {
            totalSucceeded: weightRecordsSection.succeeded + feedRecordsSection.succeeded,
            totalFailed: weightRecordsSection.failed + feedRecordsSection.failed,
            weightRecords: weightRecordsSection,
            feedRecords: feedRecordsSection,
        };
    }

    private async processWeightRecords(
        operations: SyncWeightRecordEngordeOperationDto[],
        localIdToServerId: Map<string, number>,
    ): Promise<SyncCriaSectionDto> {
        const results: SyncCriaOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                const baseFields = { eventDate: op.happenedAt as unknown as Date, isSynced: true };
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.registerWeightRecordUseCase.execute(
                            { ...data, ...baseFields, localId: op.localId } as RegisterWeightRecordDto,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.updateWeightRecordUseCase.execute(op.serverId!, data as UpdateWeightRecordDto);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        await this.deleteWeightRecordUseCase.execute(op.serverId!);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('weight_record', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }

        return this.buildSection(results);
    }

    private async processFeedRecords(
        operations: SyncFeedRecordOperationDto[],
        localIdToServerId: Map<string, number>,
    ): Promise<SyncCriaSectionDto> {
        const results: SyncCriaOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.registerFeedRecordUseCase.execute(
                            { ...data, isSynced: true, localId: op.localId } as RegisterFeedRecordDto,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.updateFeedRecordUseCase.execute(op.serverId!, data as UpdateFeedRecordDto);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        await this.deleteFeedRecordUseCase.execute(op.serverId!);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('feed_record', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }

        return this.buildSection(results);
    }

    private resolveLocalRefs(data: Record<string, any>, map: Map<string, number>): Record<string, any> {
        const resolved: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('localRef_')) {
                const field = key.replace('localRef_', '');
                const id = map.get(value as string);
                if (id !== undefined) resolved[field] = id;
            } else {
                resolved[key] = value;
            }
        }
        return resolved;
    }

    private buildSection(results: SyncCriaOperationResultDto[]): SyncCriaSectionDto {
        return {
            succeeded: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
            results,
        };
    }

    private extractMessage(error: any): string {
        const msg = error?.response?.message;
        if (Array.isArray(msg) && msg.length > 0) return String(msg[0]);
        return msg ?? error?.message ?? 'Error desconocido';
    }

    private logError(entity: string, localId: string, operation: string, error: any): void {
        this.logger.warn(`Sync ENGORDE: localId="${localId}" entity="${entity}" op="${operation}" → ${error?.message ?? error}`);
    }
}
