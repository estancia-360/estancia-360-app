import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SyncRecriaDto, SyncWeightRecordOperationDto, SyncRearingSelectionOperationDto } from '../dto/inputs/sync-recria.dto';
import { SyncRecriaResponseDto } from '../dto/outputs/sync-recria-response.dto';
import { SyncCriaSectionDto, SyncCriaOperationResultDto } from '../dto/outputs/sync-cria-response.dto';
import { RegisterWeightRecordUseCase } from 'src/app/rearing/use-cases/register-weight-record.use-case';
import { UpdateWeightRecordUseCase } from 'src/app/rearing/use-cases/update-weight-record.use-case';
import { DeleteWeightRecordUseCase } from 'src/app/rearing/use-cases/delete-weight-record.use-case';
import { RegisterRearingSelectionUseCase } from 'src/app/rearing/use-cases/register-rearing-selection.use-case';
import { UpdateRearingSelectionUseCase } from 'src/app/rearing/use-cases/update-rearing-selection.use-case';
import { DeleteRearingSelectionUseCase } from 'src/app/rearing/use-cases/delete-rearing-selection.use-case';
import { RegisterWeightRecordDto } from 'src/app/rearing/dto/inputs/register-weight-record.dto';
import { UpdateWeightRecordDto } from 'src/app/rearing/dto/inputs/update-weight-record.dto';
import { RegisterRearingSelectionDto } from 'src/app/rearing/dto/inputs/register-rearing-selection.dto';
import { UpdateRearingSelectionDto } from 'src/app/rearing/dto/inputs/update-rearing-selection.dto';

@Injectable()
export class SyncRecriaBatchUseCase {
    private readonly logger = new Logger(SyncRecriaBatchUseCase.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly registerWeightRecordUseCase: RegisterWeightRecordUseCase,
        private readonly updateWeightRecordUseCase: UpdateWeightRecordUseCase,
        private readonly deleteWeightRecordUseCase: DeleteWeightRecordUseCase,
        private readonly registerRearingSelectionUseCase: RegisterRearingSelectionUseCase,
        private readonly updateRearingSelectionUseCase: UpdateRearingSelectionUseCase,
        private readonly deleteRearingSelectionUseCase: DeleteRearingSelectionUseCase,
    ) {}

    /**
     * Procesa el batch completo de sincronización offline del módulo de RECRÍA.
     *
     * Orden:
     *   1. weightRecords  → pesajes (sin dependencias entre sí)
     *   2. rearingSelections → selecciones (pueden depender de animal actualizado por pesaje)
     */
    async execute(dto: SyncRecriaDto): Promise<SyncRecriaResponseDto> {
        const localIdToServerId = new Map<string, number>();

        const weightRecordsSection = await this.processWeightRecords(
            dto.weightRecords ?? [],
            localIdToServerId,
        );

        const rearingSelectionsSection = await this.processRearingSelections(
            dto.rearingSelections ?? [],
            localIdToServerId,
        );

        return {
            totalSucceeded: weightRecordsSection.succeeded + rearingSelectionsSection.succeeded,
            totalFailed: weightRecordsSection.failed + rearingSelectionsSection.failed,
            weightRecords: weightRecordsSection,
            rearingSelections: rearingSelectionsSection,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Sección 1: Pesajes
    // ─────────────────────────────────────────────────────────────────────────

    private async processWeightRecords(
        operations: SyncWeightRecordOperationDto[],
        localIdToServerId: Map<string, number>,
    ): Promise<SyncCriaSectionDto> {
        const results: SyncCriaOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                const baseFields = {
                    eventDate: op.happenedAt as unknown as Date,
                    isSynced: true,
                };
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.executeInTransaction(async () =>
                            this.registerWeightRecordUseCase.execute({ ...data, ...baseFields, localId: op.localId } as RegisterWeightRecordDto),
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.executeInTransaction(async () =>
                            this.updateWeightRecordUseCase.execute(op.serverId!, data as UpdateWeightRecordDto),
                        );
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        await this.executeInTransaction(async () =>
                            this.deleteWeightRecordUseCase.execute(op.serverId!),
                        );
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('weight_record', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Sección 2: Selecciones de recría
    // ─────────────────────────────────────────────────────────────────────────

    private async processRearingSelections(
        operations: SyncRearingSelectionOperationDto[],
        localIdToServerId: Map<string, number>,
    ): Promise<SyncCriaSectionDto> {
        const results: SyncCriaOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                const baseFields = {
                    eventDate: op.happenedAt as unknown as Date,
                    isSynced: true,
                };
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.executeInTransaction(async () =>
                            this.registerRearingSelectionUseCase.execute({ ...data, ...baseFields, localId: op.localId } as RegisterRearingSelectionDto),
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.executeInTransaction(async () =>
                            this.updateRearingSelectionUseCase.execute(op.serverId!, data as UpdateRearingSelectionDto),
                        );
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        await this.executeInTransaction(async () =>
                            this.deleteRearingSelectionUseCase.execute(op.serverId!),
                        );
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('rearing_selection', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private async executeInTransaction<T>(fn: () => Promise<T>): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const result = await fn();
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private resolveLocalRefs(data: Record<string, any>, localIdToServerId: Map<string, number>): Record<string, any> {
        const resolved: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('localRef_')) {
                const targetField = key.replace('localRef_', '');
                const id = localIdToServerId.get(value as string);
                if (id !== undefined) resolved[targetField] = id;
            } else {
                resolved[key] = value;
            }
        }
        return resolved;
    }

    private buildSectionResult(results: SyncCriaOperationResultDto[]): SyncCriaSectionDto {
        return {
            succeeded: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
            results,
        };
    }

    private extractErrorMessage(error: any): string {
        const msg = error?.response?.message;
        if (Array.isArray(msg) && msg.length > 0) return String(msg[0]);
        return msg ?? error?.message ?? 'Error desconocido';
    }

    private logOperationError(entity: string, localId: string, operation: string, error: any): void {
        this.logger.warn(
            `Sync RECRÍA: localId="${localId}" entity="${entity}" op="${operation}" → ${error?.message ?? error}`,
        );
    }
}
