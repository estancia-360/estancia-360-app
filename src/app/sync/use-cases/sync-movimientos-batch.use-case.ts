import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
    SyncMovimientosDto,
    SyncAnimalExitOperationDto,
    SyncMovementOperationDto,
    SyncMovementAnimalOperationDto,
} from '../dto/inputs/sync-movimientos.dto';
import { SyncMovimientosResponseDto } from '../dto/outputs/sync-movimientos-response.dto';
import { SyncSectionDto, SyncOperationResultDto } from '../dto/outputs/sync-common.dto';
import { RegisterMovementUseCase } from 'src/app/movements/use-cases/register-movement.use-case';
import { ConfirmMovementAnimalUseCase } from 'src/app/movements/use-cases/confirm-movement-animal.use-case';
import { CancelMovementUseCase } from 'src/app/movements/use-cases/cancel-movement.use-case';
import { RegisterAnimalExitUseCase } from 'src/app/movements/use-cases/register-animal-exit.use-case';
import { UpdateAnimalExitUseCase } from 'src/app/movements/use-cases/update-animal-exit.use-case';
import { RegisterMovementDto } from 'src/app/movements/dto/inputs/register-movement.dto';
import { ConfirmMovementAnimalDto } from 'src/app/movements/dto/inputs/confirm-movement-animal.dto';
import { RegisterAnimalExitDto } from 'src/app/movements/dto/inputs/register-animal-exit.dto';
import { UpdateAnimalExitDto } from 'src/app/movements/dto/inputs/update-animal-exit.dto';

@Injectable()
export class SyncMovimientosBatchUseCase {
    private readonly logger = new Logger(SyncMovimientosBatchUseCase.name);

    constructor(
        private readonly registerMovementUseCase: RegisterMovementUseCase,
        private readonly confirmMovementAnimalUseCase: ConfirmMovementAnimalUseCase,
        private readonly cancelMovementUseCase: CancelMovementUseCase,
        private readonly registerAnimalExitUseCase: RegisterAnimalExitUseCase,
        private readonly updateAnimalExitUseCase: UpdateAnimalExitUseCase,
    ) {}

    async execute(dto: SyncMovimientosDto, idUser: number): Promise<SyncMovimientosResponseDto> {
        const localIdToServerId = new Map<string, number>();
        const movementAnimalResults: SyncOperationResultDto[] = [];

        const animalExits = await this.processAnimalExits(dto.animalExits ?? [], idUser, localIdToServerId);
        const movements = await this.processMovements(dto.movements ?? [], dto.idRanch, idUser, localIdToServerId, movementAnimalResults);
        await this.processMovementAnimals(dto.movementAnimals ?? [], idUser, localIdToServerId, movementAnimalResults);

        const movementAnimals = this.buildSection(movementAnimalResults);

        return {
            totalSucceeded: animalExits.succeeded + movements.succeeded + movementAnimals.succeeded,
            totalFailed: animalExits.failed + movements.failed + movementAnimals.failed,
            animalExits,
            movements,
            movementAnimals,
        };
    }

    private async processAnimalExits(
        operations: SyncAnimalExitOperationDto[],
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
                        const result = await this.registerAnimalExitUseCase.execute(
                            { ...data, eventDate: op.happenedAt as unknown as Date, isSynced: true, localId: op.localId } as RegisterAnimalExitDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateAnimalExitUseCase.execute(op.serverId, data as UpdateAnimalExitDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        throw new BadRequestException('animal_exits do not support delete — irreversible (RN-07/RN-10)');
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('animal_exit', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }

        return this.buildSection(results);
    }

    private async processMovements(
        operations: SyncMovementOperationDto[],
        idRanch: number,
        idUser: number,
        localIdToServerId: Map<string, number>,
        movementAnimalResults: SyncOperationResultDto[],
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const animals = ((data.animals ?? []) as Record<string, any>[]).map((a) => this.resolveLocalRefs(a, localIdToServerId));
                        const result = await this.registerMovementUseCase.execute(
                            {
                                ...data,
                                idRanch,
                                animals,
                                isSynced: true,
                                localId: op.localId,
                            } as RegisterMovementDto,
                            idUser,
                        );
                        serverId = result.id;

                        for (const ma of result.animals) {
                            if (ma.localId) {
                                localIdToServerId.set(ma.localId, ma.id);
                                movementAnimalResults.push({ localId: ma.localId, status: 'success', serverId: ma.id });
                            }
                        }
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        if (data.status !== 'cancelled') {
                            throw new BadRequestException('Updating a movement only accepts { status: "cancelled" } — confirmations go through movementAnimals');
                        }
                        await this.cancelMovementUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        throw new BadRequestException('Movements do not support delete — use update { status: "cancelled" }');
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('movement', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }

        return this.buildSection(results);
    }

    private async processMovementAnimals(
        operations: SyncMovementAnimalOperationDto[],
        idUser: number,
        localIdToServerId: Map<string, number>,
        movementAnimalResults: SyncOperationResultDto[],
    ): Promise<void> {
        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);

                if (op.operation !== 'update') {
                    throw new BadRequestException('movementAnimals only supports update (confirm/reject) — nested details are created within the parent movement');
                }

                let targetId = op.serverId;
                if (!targetId && op.localId && localIdToServerId.has(op.localId)) {
                    targetId = localIdToServerId.get(op.localId);
                }
                if (!targetId) throw new BadRequestException('serverId is required for update');

                await this.confirmMovementAnimalUseCase.execute(
                    targetId,
                    { status: data.status, notes: data.notes, isSynced: true } as ConfirmMovementAnimalDto,
                    idUser,
                );

                movementAnimalResults.push({ localId: op.localId, status: 'success', serverId: targetId });
            } catch (error: any) {
                this.logError('movement_animal', op.localId, op.operation, error);
                movementAnimalResults.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }
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
        this.logger.warn(`Sync MOVIMIENTOS: localId="${localId}" entity="${entity}" op="${operation}" → ${error?.message ?? error}`);
    }
}
