import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
    SyncEngordeDto,
    SyncWeightRecordEngordeOperationDto,
    SyncFeedRecordOperationDto,
    SyncFatteningEntryOperationDto,
} from '../dto/inputs/sync-engorde.dto';
import { SyncEngordeResponseDto } from '../dto/outputs/sync-engorde-response.dto';
import { SyncSectionDto, SyncOperationResultDto } from '../dto/outputs/sync-common.dto';
import { RegisterWeightRecordUseCase } from 'src/app/rearing/use-cases/register-weight-record.use-case';
import { UpdateWeightRecordUseCase } from 'src/app/rearing/use-cases/update-weight-record.use-case';
import { DeleteWeightRecordUseCase } from 'src/app/rearing/use-cases/delete-weight-record.use-case';
import { RegisterFeedRecordUseCase } from 'src/app/fattening/use-cases/register-feed-record.use-case';
import { UpdateFeedRecordUseCase } from 'src/app/fattening/use-cases/update-feed-record.use-case';
import { DeleteFeedRecordUseCase } from 'src/app/fattening/use-cases/delete-feed-record.use-case';
import { RegisterFatteningEntryUseCase } from 'src/app/fattening/use-cases/register-fattening-entry.use-case';
import { UpdateFatteningEntryUseCase } from 'src/app/fattening/use-cases/update-fattening-entry.use-case';
import { DeleteFatteningEntryUseCase } from 'src/app/fattening/use-cases/delete-fattening-entry.use-case';
import { RegisterWeightRecordDto } from 'src/app/rearing/dto/inputs/register-weight-record.dto';
import { UpdateWeightRecordDto } from 'src/app/rearing/dto/inputs/update-weight-record.dto';
import { RegisterFeedRecordDto } from 'src/app/fattening/dto/inputs/register-feed-record.dto';
import { UpdateFeedRecordDto } from 'src/app/fattening/dto/inputs/update-feed-record.dto';
import { RegisterFatteningEntryDto } from 'src/app/fattening/dto/inputs/register-fattening-entry.dto';
import { UpdateFatteningEntryDto } from 'src/app/fattening/dto/inputs/update-fattening-entry.dto';

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
        private readonly registerFatteningEntryUseCase: RegisterFatteningEntryUseCase,
        private readonly updateFatteningEntryUseCase: UpdateFatteningEntryUseCase,
        private readonly deleteFatteningEntryUseCase: DeleteFatteningEntryUseCase,
    ) {}

    async execute(dto: SyncEngordeDto, idUser: number): Promise<SyncEngordeResponseDto> {
        const localIdToServerId = new Map<string, number>();

        const fatteningEntries = await this.processFatteningEntries(dto.fatteningEntries ?? [], idUser, localIdToServerId);
        const weightRecords = await this.processWeightRecords(dto.weightRecords ?? [], localIdToServerId, idUser);
        const feedRecords = await this.processFeedRecords(dto.feedRecords ?? [], idUser, localIdToServerId);

        return {
            totalSucceeded: fatteningEntries.succeeded + weightRecords.succeeded + feedRecords.succeeded,
            totalFailed: fatteningEntries.failed + weightRecords.failed + feedRecords.failed,
            fatteningEntries,
            weightRecords,
            feedRecords,
        };
    }

    private async processFatteningEntries(
        operations: SyncFatteningEntryOperationDto[],
        idUser: number,
        localIdToServerId: Map<string, number>,
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.registerFatteningEntryUseCase.execute(
                            { ...data, eventDate: op.happenedAt as unknown as Date, isSynced: true, localId: op.localId } as RegisterFatteningEntryDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateFatteningEntryUseCase.execute(op.serverId, data as UpdateFatteningEntryDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteFatteningEntryUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('fattening_entry', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }

        return this.buildSection(results);
    }

    private async processWeightRecords(
        operations: SyncWeightRecordEngordeOperationDto[],
        localIdToServerId: Map<string, number>,
        idUser: number,
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                const baseFields = { eventDate: op.happenedAt as unknown as Date, isSynced: true };
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.registerWeightRecordUseCase.execute(
                            { ...data, ...baseFields, localId: op.localId } as RegisterWeightRecordDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateWeightRecordUseCase.execute(op.serverId, data as UpdateWeightRecordDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteWeightRecordUseCase.execute(op.serverId, idUser);
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
        idUser: number,
        localIdToServerId: Map<string, number>,
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.registerFeedRecordUseCase.execute(
                            { ...data, isSynced: true, localId: op.localId } as RegisterFeedRecordDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateFeedRecordUseCase.execute(op.serverId, data as UpdateFeedRecordDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteFeedRecordUseCase.execute(op.serverId, idUser);
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
                if (id === undefined) {
                    throw new BadRequestException(`localRef_${field}="${value}" does not match any localId registered earlier in this batch`);
                }
                resolved[field] = id;
            } else {
                resolved[key] = value;
            }
        }
        return resolved;
    }

    private buildSection(results: SyncOperationResultDto[]): SyncSectionDto {
        return {
            succeeded: results.filter((r) => r.status === 'success').length,
            failed: results.filter((r) => r.status === 'failed').length,
            results,
        };
    }

    private extractMessage(error: any): string {
        const msg = error?.response?.message;
        if (Array.isArray(msg) && msg.length > 0) return String(msg[0]);
        return msg ?? error?.message ?? 'Unknown error';
    }

    private logError(entity: string, localId: string, operation: string, error: any): void {
        this.logger.warn(`Sync ENGORDE: localId="${localId}" entity="${entity}" op="${operation}" → ${error?.message ?? error}`);
    }
}
