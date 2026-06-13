import { Injectable, Logger } from '@nestjs/common';
import { SyncBreedingDto } from '../dto/inputs/sync-breeding.dto';
import { SyncBreedingResponseDto, SyncOperationResultDto } from '../dto/outputs/sync-breeding-response.dto';

// Register use-cases
import { RegisterBreedingServiceUseCase } from './register-breeding-service.use-case';
import { RegisterGestationDiagnosisUseCase } from './register-gestation-diagnosis.use-case';
import { RegisterParturitionUseCase } from './register-parturition.use-case';
import { RegisterWeaningUseCase } from './register-weaning.use-case';
import { RegisterAnimalDeclaredHistoryUseCase } from './register-animal-declared-history.use-case';

// Update use-cases
import { UpdateBreedingServiceUseCase } from './update-breeding-service.use-case';
import { UpdateGestationDiagnosisUseCase } from './update-gestation-diagnosis.use-case';
import { UpdateParturitionUseCase } from './update-parturition.use-case';
import { UpdateWeaningUseCase } from './update-weaning.use-case';
import { UpdateAnimalDeclaredHistoryUseCase } from './update-animal-declared-history.use-case';

// Delete use-cases
import { DeleteBreedingServiceUseCase } from './delete-breeding-service.use-case';
import { DeleteGestationDiagnosisUseCase } from './delete-gestation-diagnosis.use-case';
import { DeleteParturitionUseCase } from './delete-parturition.use-case';
import { DeleteWeaningUseCase } from './delete-weaning.use-case';
import { DeleteAnimalDeclaredHistoryUseCase } from './delete-animal-declared-history.use-case';

// Input DTOs
import { RegisterBreedingServiceDto } from '../dto/inputs/register-breeding-service.dto';
import { RegisterGestationDiagnosisDto } from '../dto/inputs/register-gestation-diagnosis.dto';
import { RegisterParturitionDto } from '../dto/inputs/register-parturition.dto';
import { RegisterWeaningDto } from '../dto/inputs/register-weaning.dto';
import { RegisterAnimalDeclaredHistoryDto } from '../dto/inputs/register-animal-declared-history.dto';
import { UpdateBreedingServiceDto } from '../dto/inputs/update-breeding-service.dto';
import { UpdateGestationDiagnosisDto } from '../dto/inputs/update-gestation-diagnosis.dto';
import { UpdateParturitionDto } from '../dto/inputs/update-parturition.dto';
import { UpdateWeaningDto } from '../dto/inputs/update-weaning.dto';
import { UpdateAnimalDeclaredHistoryDto } from '../dto/inputs/update-animal-declared-history.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class SyncBreedingBatchUseCase {
    private readonly logger = new Logger(SyncBreedingBatchUseCase.name);

    constructor(
        // Register
        private readonly registerBreedingServiceUseCase: RegisterBreedingServiceUseCase,
        private readonly registerGestationDiagnosisUseCase: RegisterGestationDiagnosisUseCase,
        private readonly registerParturitionUseCase: RegisterParturitionUseCase,
        private readonly registerWeaningUseCase: RegisterWeaningUseCase,
        private readonly registerAnimalDeclaredHistoryUseCase: RegisterAnimalDeclaredHistoryUseCase,
        // Update
        private readonly updateBreedingServiceUseCase: UpdateBreedingServiceUseCase,
        private readonly updateGestationDiagnosisUseCase: UpdateGestationDiagnosisUseCase,
        private readonly updateParturitionUseCase: UpdateParturitionUseCase,
        private readonly updateWeaningUseCase: UpdateWeaningUseCase,
        private readonly updateAnimalDeclaredHistoryUseCase: UpdateAnimalDeclaredHistoryUseCase,
        // Delete
        private readonly deleteBreedingServiceUseCase: DeleteBreedingServiceUseCase,
        private readonly deleteGestationDiagnosisUseCase: DeleteGestationDiagnosisUseCase,
        private readonly deleteParturitionUseCase: DeleteParturitionUseCase,
        private readonly deleteWeaningUseCase: DeleteWeaningUseCase,
        private readonly deleteAnimalDeclaredHistoryUseCase: DeleteAnimalDeclaredHistoryUseCase,
    ) {}

    /**
     * Procesa un batch de operaciones reproductivas provenientes de la app móvil offline.
     *
     * Diseño:
     *  - Las operaciones se procesan en el mismo orden en que se enviaron (cronológico).
     *  - Cada operación se ejecuta en su propia transacción atómica. Si una falla, las
     *    demás continúan procesándose (el servidor no aborta todo el batch).
     *  - Se mantiene un mapa localId → serverId para resolver referencias cruzadas dentro
     *    del mismo batch (e.g. crear un diagnóstico que referencia un servicio creado en la
     *    misma sincronización).
     *  - Los campos `localRef_<campo>` en el payload `data` se resuelven automáticamente
     *    antes de llamar al caso de uso correspondiente.
     *
     * Operaciones soportadas:
     *  - create: registrar nuevo evento reproductivo
     *  - update: modificar campos de un registro existente (requiere serverId)
     *  - delete: eliminar un registro existente con su cascada (requiere serverId)
     */
    async execute(dto: SyncBreedingDto): Promise<SyncBreedingResponseDto> {
        const localIdToServerId = new Map<string, number>();
        const results: SyncOperationResultDto[] = [];

        for (const operation of dto.operations) {
            try {
                const resolvedData = this.resolveLocalRefs(operation.data, localIdToServerId);
                const baseFields = {
                    eventDate: operation.happenedAt as unknown as Date,
                    isSynced: true,
                };

                let serverId: number | undefined;

                switch (operation.operation) {
                    // ──────────────────────────────────────────────────
                    //  CREATE
                    // ──────────────────────────────────────────────────
                    case 'create': {
                        switch (operation.type) {
                            case 'breeding_service': {
                                const dto: RegisterBreedingServiceDto = { ...resolvedData, ...baseFields } as RegisterBreedingServiceDto;
                                const result = await this.registerBreedingServiceUseCase.execute(dto);
                                serverId = result.id;
                                break;
                            }
                            case 'gestation_diagnosis': {
                                const dto: RegisterGestationDiagnosisDto = { ...resolvedData, ...baseFields } as RegisterGestationDiagnosisDto;
                                const result = await this.registerGestationDiagnosisUseCase.execute(dto);
                                serverId = result.id;
                                break;
                            }
                            case 'parturition': {
                                const dto: RegisterParturitionDto = { ...resolvedData, ...baseFields } as RegisterParturitionDto;
                                const result = await this.registerParturitionUseCase.execute(dto);
                                serverId = result.id;
                                break;
                            }
                            case 'weaning': {
                                const dto: RegisterWeaningDto = { ...resolvedData, ...baseFields } as RegisterWeaningDto;
                                const result = await this.registerWeaningUseCase.execute(dto);
                                serverId = result.id;
                                break;
                            }
                            case 'animal_declared_history': {
                                const dto: RegisterAnimalDeclaredHistoryDto = { ...resolvedData } as RegisterAnimalDeclaredHistoryDto;
                                const result = await this.registerAnimalDeclaredHistoryUseCase.execute(dto);
                                serverId = result.id;
                                break;
                            }
                            default:
                                throw new Error(`Tipo no soportado para create: ${(operation as any).type}`);
                        }
                        break;
                    }

                    // ──────────────────────────────────────────────────
                    //  UPDATE
                    // ──────────────────────────────────────────────────
                    case 'update': {
                        if (!operation.serverId) {
                            throw new BadRequestException('serverId es requerido para operaciones update');
                        }
                        const id = operation.serverId;
                        switch (operation.type) {
                            case 'breeding_service': {
                                const dto: UpdateBreedingServiceDto = resolvedData as UpdateBreedingServiceDto;
                                await this.updateBreedingServiceUseCase.execute(id, dto);
                                break;
                            }
                            case 'gestation_diagnosis': {
                                const dto: UpdateGestationDiagnosisDto = resolvedData as UpdateGestationDiagnosisDto;
                                await this.updateGestationDiagnosisUseCase.execute(id, dto);
                                break;
                            }
                            case 'parturition': {
                                const dto: UpdateParturitionDto = resolvedData as UpdateParturitionDto;
                                await this.updateParturitionUseCase.execute(id, dto);
                                break;
                            }
                            case 'weaning': {
                                const dto: UpdateWeaningDto = resolvedData as UpdateWeaningDto;
                                await this.updateWeaningUseCase.execute(id, dto);
                                break;
                            }
                            case 'animal_declared_history': {
                                const dto: UpdateAnimalDeclaredHistoryDto = resolvedData as UpdateAnimalDeclaredHistoryDto;
                                await this.updateAnimalDeclaredHistoryUseCase.execute(id, dto);
                                break;
                            }
                            default:
                                throw new Error(`Tipo no soportado para update: ${(operation as any).type}`);
                        }
                        serverId = id;
                        break;
                    }

                    // ──────────────────────────────────────────────────
                    //  DELETE
                    // ──────────────────────────────────────────────────
                    case 'delete': {
                        if (!operation.serverId) {
                            throw new BadRequestException('serverId es requerido para operaciones delete');
                        }
                        const id = operation.serverId;
                        switch (operation.type) {
                            case 'breeding_service':
                                await this.deleteBreedingServiceUseCase.execute(id);
                                break;
                            case 'gestation_diagnosis':
                                await this.deleteGestationDiagnosisUseCase.execute(id);
                                break;
                            case 'parturition':
                                await this.deleteParturitionUseCase.execute(id);
                                break;
                            case 'weaning':
                                await this.deleteWeaningUseCase.execute(id);
                                break;
                            case 'animal_declared_history':
                                await this.deleteAnimalDeclaredHistoryUseCase.execute(id);
                                break;
                            default:
                                throw new Error(`Tipo no soportado para delete: ${(operation as any).type}`);
                        }
                        serverId = id;
                        break;
                    }

                    default:
                        throw new Error(`Operación no soportada: ${(operation as any).operation}`);
                }

                if (serverId !== undefined) {
                    localIdToServerId.set(operation.localId, serverId);
                }

                results.push({
                    localId: operation.localId,
                    status: 'success',
                    serverId,
                    type: operation.type,
                });
            } catch (error: any) {
                this.logger.warn(
                    `Sync batch: operación localId="${operation.localId}" type="${operation.type}" op="${operation.operation}" falló: ${error?.message ?? error}`,
                );
                results.push({
                    localId: operation.localId,
                    status: 'failed',
                    type: operation.type,
                    error: error?.response?.message?.[0] ?? error?.message ?? 'Error desconocido',
                });
            }
        }

        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        return { succeeded, failed, results };
    }

    /**
     * Resuelve los campos `localRef_<campo>` de un payload, sustituyéndolos por el
     * ID real asignado por el servidor. El campo `localRef_idService: "uuid-001"`
     * se convierte en `idService: <serverId>` usando el mapa acumulado del batch.
     *
     * Si un localRef no se puede resolver (no corresponde a un localId de este batch,
     * p.ej. porque la operación de origen falló o porque se referenció un serverId
     * existente por error), se lanza BadRequestException — la operación se marca
     * como fallida en el resultado del batch.
     */
    private resolveLocalRefs(
        data: Record<string, any>,
        localIdToServerId: Map<string, number>,
    ): Record<string, any> {
        const resolved: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('localRef_')) {
                const targetField = key.replace('localRef_', '');
                const id = localIdToServerId.get(value as string);
                if (id === undefined) {
                    throw new BadRequestException(`localRef_${targetField}="${value}" no corresponde a ningún localId registrado en este batch`);
                }
                resolved[targetField] = id;
            } else {
                resolved[key] = value;
            }
        }

        return resolved;
    }
}
