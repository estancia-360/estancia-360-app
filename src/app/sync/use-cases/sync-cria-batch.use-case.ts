import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

// DTOs
import {
    SyncCriaDto,
    SyncRanchPastureOperationDto,
    SyncRanchLotOperationDto,
    SyncRanchAnimalOperationDto,
    SyncBreedingEventOperationDto,
} from '../dto/inputs/sync-cria.dto';
import {
    SyncCriaResponseDto,
    SyncCriaSectionDto,
    SyncCriaOperationResultDto,
} from '../dto/outputs/sync-cria-response.dto';

// Entidades base
import { RanchPasture } from 'src/modules/ranch-management/ranch-pastures/entities/ranch-pasture.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

// Servicios base (para create/update/delete de potreros, lotes y animales)
import { RanchPasturesService } from 'src/modules/ranch-management/ranch-pastures/services/ranch-pastures.service';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';

// Use-cases de CRÍA (reutilizamos los mismos del módulo breeding)
import { RegisterBreedingServiceUseCase } from 'src/app/breeding/use-cases/register-breeding-service.use-case';
import { RegisterGestationDiagnosisUseCase } from 'src/app/breeding/use-cases/register-gestation-diagnosis.use-case';
import { RegisterParturitionUseCase } from 'src/app/breeding/use-cases/register-parturition.use-case';
import { RegisterWeaningUseCase } from 'src/app/breeding/use-cases/register-weaning.use-case';
import { RegisterAnimalDeclaredHistoryUseCase } from 'src/app/breeding/use-cases/register-animal-declared-history.use-case';

import { UpdateBreedingServiceUseCase } from 'src/app/breeding/use-cases/update-breeding-service.use-case';
import { UpdateGestationDiagnosisUseCase } from 'src/app/breeding/use-cases/update-gestation-diagnosis.use-case';
import { UpdateParturitionUseCase } from 'src/app/breeding/use-cases/update-parturition.use-case';
import { UpdateWeaningUseCase } from 'src/app/breeding/use-cases/update-weaning.use-case';
import { UpdateAnimalDeclaredHistoryUseCase } from 'src/app/breeding/use-cases/update-animal-declared-history.use-case';

import { DeleteBreedingServiceUseCase } from 'src/app/breeding/use-cases/delete-breeding-service.use-case';
import { DeleteGestationDiagnosisUseCase } from 'src/app/breeding/use-cases/delete-gestation-diagnosis.use-case';
import { DeleteParturitionUseCase } from 'src/app/breeding/use-cases/delete-parturition.use-case';
import { DeleteWeaningUseCase } from 'src/app/breeding/use-cases/delete-weaning.use-case';
import { DeleteAnimalDeclaredHistoryUseCase } from 'src/app/breeding/use-cases/delete-animal-declared-history.use-case';

// DTOs de los use-cases de CRÍA
import { RegisterBreedingServiceDto } from 'src/app/breeding/dto/inputs/register-breeding-service.dto';
import { RegisterGestationDiagnosisDto } from 'src/app/breeding/dto/inputs/register-gestation-diagnosis.dto';
import { RegisterParturitionDto } from 'src/app/breeding/dto/inputs/register-parturition.dto';
import { RegisterWeaningDto } from 'src/app/breeding/dto/inputs/register-weaning.dto';
import { RegisterAnimalDeclaredHistoryDto } from 'src/app/breeding/dto/inputs/register-animal-declared-history.dto';
import { UpdateBreedingServiceDto } from 'src/app/breeding/dto/inputs/update-breeding-service.dto';
import { UpdateGestationDiagnosisDto } from 'src/app/breeding/dto/inputs/update-gestation-diagnosis.dto';
import { UpdateParturitionDto } from 'src/app/breeding/dto/inputs/update-parturition.dto';
import { UpdateWeaningDto } from 'src/app/breeding/dto/inputs/update-weaning.dto';
import { UpdateAnimalDeclaredHistoryDto } from 'src/app/breeding/dto/inputs/update-animal-declared-history.dto';
import { RanchAnimalDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class SyncCriaBatchUseCase {
    private readonly logger = new Logger(SyncCriaBatchUseCase.name);

    constructor(
        // DataSource para transacciones
        private readonly dataSource: DataSource,

        // Repositorios de entidades base (para buscar por local_id — idempotencia)
        @InjectRepository(RanchPasture)
        private readonly ranchPastureRepository: Repository<RanchPasture>,
        @InjectRepository(RanchLot)
        private readonly ranchLotRepository: Repository<RanchLot>,
        @InjectRepository(RanchAnimal)
        private readonly ranchAnimalRepository: Repository<RanchAnimal>,

        // Servicios base
        private readonly ranchPasturesService: RanchPasturesService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly ranchAnimalsService: RanchAnimalsService,

        // Use-cases de CRÍA — Register
        private readonly registerBreedingServiceUseCase: RegisterBreedingServiceUseCase,
        private readonly registerGestationDiagnosisUseCase: RegisterGestationDiagnosisUseCase,
        private readonly registerParturitionUseCase: RegisterParturitionUseCase,
        private readonly registerWeaningUseCase: RegisterWeaningUseCase,
        private readonly registerAnimalDeclaredHistoryUseCase: RegisterAnimalDeclaredHistoryUseCase,

        // Use-cases de CRÍA — Update
        private readonly updateBreedingServiceUseCase: UpdateBreedingServiceUseCase,
        private readonly updateGestationDiagnosisUseCase: UpdateGestationDiagnosisUseCase,
        private readonly updateParturitionUseCase: UpdateParturitionUseCase,
        private readonly updateWeaningUseCase: UpdateWeaningUseCase,
        private readonly updateAnimalDeclaredHistoryUseCase: UpdateAnimalDeclaredHistoryUseCase,

        // Use-cases de CRÍA — Delete
        private readonly deleteBreedingServiceUseCase: DeleteBreedingServiceUseCase,
        private readonly deleteGestationDiagnosisUseCase: DeleteGestationDiagnosisUseCase,
        private readonly deleteParturitionUseCase: DeleteParturitionUseCase,
        private readonly deleteWeaningUseCase: DeleteWeaningUseCase,
        private readonly deleteAnimalDeclaredHistoryUseCase: DeleteAnimalDeclaredHistoryUseCase,
    ) { }

    /**
     * Procesa el batch completo de sincronización offline del módulo de CRÍA.
     *
     * Orden de procesamiento (dependencias en cascada):
     *   1. ranchPastures  → sin dependencias externas
     *   2. ranchLots      → pueden depender de potreros del mismo batch
     *   3. ranchAnimals   → pueden depender de lotes del mismo batch
     *   4. breedingEvents → pueden depender de animales del mismo batch
     *
     * Cada operación falla de forma independiente: si una falla, las demás continúan.
     * El mapa localId→serverId se comparte entre todas las secciones.
     */
    async execute(dto: SyncCriaDto): Promise<SyncCriaResponseDto> {
        // Mapa global de localId → serverId compartido entre todas las secciones
        const localIdToServerId = new Map<string, number>();

        // ── 1. Potreros ──────────────────────────────────────────────────────
        const ranchPasturesSection = await this.processRanchPastures(
            dto.ranchPastures ?? [],
            dto.idRanch,
            localIdToServerId,
        );

        // ── 2. Lotes ─────────────────────────────────────────────────────────
        const ranchLotsSection = await this.processRanchLots(
            dto.ranchLots ?? [],
            dto.idRanch,
            localIdToServerId,
        );

        // ── 3. Animales ──────────────────────────────────────────────────────
        const ranchAnimalsSection = await this.processRanchAnimals(
            dto.ranchAnimals ?? [],
            localIdToServerId,
        );

        // ── 4. Eventos de CRÍA ───────────────────────────────────────────────
        const breedingEventsSection = await this.processBreedingEvents(
            dto.breedingEvents ?? [],
            localIdToServerId,
        );

        const totalSucceeded =
            ranchPasturesSection.succeeded +
            ranchLotsSection.succeeded +
            ranchAnimalsSection.succeeded +
            breedingEventsSection.succeeded;

        const totalFailed =
            ranchPasturesSection.failed +
            ranchLotsSection.failed +
            ranchAnimalsSection.failed +
            breedingEventsSection.failed;

        return {
            totalSucceeded,
            totalFailed,
            ranchPastures: ranchPasturesSection,
            ranchLots: ranchLotsSection,
            ranchAnimals: ranchAnimalsSection,
            breedingEvents: breedingEventsSection,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Sección 1: Potreros
    // ─────────────────────────────────────────────────────────────────────────

    private async processRanchPastures(
        operations: SyncRanchPastureOperationDto[],
        idRanch: number,
        localIdToServerId: Map<string, number>,
    ): Promise<SyncCriaSectionDto> {
        const results: SyncCriaOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number;

                switch (op.operation) {
                    case 'create': {
                        // Idempotencia + Transacción: si ya existe, reutilizar; si no, crear en transacción
                        const existing = await this.ranchPastureRepository.findOne({
                            where: { localId: op.localId },
                        });
                        if (existing) {
                            serverId = Number(existing.id);
                        } else {
                            // Envolver crear + guardar localId en una transacción
                            serverId = await this.executeInTransaction(async () => {
                                const pasture = await this.ranchPasturesService.create({
                                    idRanch,
                                    name: data.name,
                                    areaHectares: data.areaHectares,
                                    description: data.description,
                                    isActive: data.isActive ?? true,
                                });
                                // Guardar localId para idempotencia en futuros reintentos
                                await this.ranchPastureRepository.update(
                                    { id: pasture.id },
                                    { localId: op.localId },
                                );
                                return Number(pasture.id);
                            });
                        }
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.executeInTransaction(async () => {
                            await this.ranchPasturesService.update(op.serverId!, {
                                name: data.name,
                                areaHectares: data.areaHectares,
                                description: data.description,
                                isActive: data.isActive,
                            });
                        });
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        await this.executeInTransaction(async () => {
                            await this.ranchPasturesService.remove(op.serverId!);
                        });
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('ranch_pasture', op.localId, op.operation, error);
                results.push({
                    localId: op.localId,
                    status: 'failed',
                    error: this.extractErrorMessage(error),
                });
            }
        }

        return this.buildSectionResult(results);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Sección 2: Lotes
    // ─────────────────────────────────────────────────────────────────────────

    private async processRanchLots(
        operations: SyncRanchLotOperationDto[],
        idRanch: number,
        localIdToServerId: Map<string, number>,
    ): Promise<SyncCriaSectionDto> {
        const results: SyncCriaOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number;

                switch (op.operation) {
                    case 'create': {
                        // Idempotencia
                        const existing = await this.ranchLotRepository.findOne({
                            where: { localId: op.localId },
                        });
                        if (existing) {
                            serverId = Number(existing.id);
                        } else {
                            serverId = await this.executeInTransaction(async () => {
                                const lot = await this.ranchLotsService.create({
                                    idRanch,
                                    idRanchPasture: data.idRanchPasture,
                                    name: data.name,
                                    lotType: data.lotType,
                                    capacity: data.capacity,
                                });
                                await this.ranchLotRepository.update(
                                    { id: lot.id },
                                    { localId: op.localId },
                                );
                                return Number(lot.id);
                            });
                        }
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.executeInTransaction(async () => {
                            await this.ranchLotsService.update(op.serverId!, {
                                name: data.name,
                                lotType: data.lotType,
                                capacity: data.capacity,
                            });
                        });
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        await this.executeInTransaction(async () => {
                            await this.ranchLotsService.remove(op.serverId!);
                        });
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('ranch_lot', op.localId, op.operation, error);
                results.push({
                    localId: op.localId,
                    status: 'failed',
                    error: this.extractErrorMessage(error),
                });
            }
        }

        return this.buildSectionResult(results);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Sección 3: Animales
    // ─────────────────────────────────────────────────────────────────────────

    private async processRanchAnimals(
        operations: SyncRanchAnimalOperationDto[],
        localIdToServerId: Map<string, number>,
    ): Promise<SyncCriaSectionDto> {
        const results: SyncCriaOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number;

                switch (op.operation) {
                    case 'create': {
                        // Idempotencia: si ya existe un animal con este localId, reutilizarlo
                        const existing = await this.ranchAnimalRepository.findOne({
                            where: { localId: op.localId },
                        });
                        if (existing) {
                            serverId = Number(existing.id);
                        } else {
                            serverId = await this.executeInTransaction(async () => {
                                const animal = await this.ranchAnimalsService.create(
                                    {
                                        idRanch: data.idRanch,
                                        idBreed: data.idBreed,
                                        idStatus: data.idStatus,
                                        idAnimalClass: data.idAnimalClass,
                                        code: data.code,
                                        sex: data.sex,
                                        birthdate: data.birthdate,
                                        weight: data.weight,
                                        codeMother: data.codeMother,
                                        codeFather: data.codeFather,
                                        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                                    },
                                    RanchAnimalDto,
                                );
                                // Actualizar con localId, origin e IDs directos de madre/padre
                                // resueltos desde localRef (el servicio create solo admite codes)
                                const updates: Partial<RanchAnimal> = { localId: op.localId };
                                if (data.origin) updates.origin = data.origin;
                                if (data.idMother) updates.idMother = data.idMother;
                                if (data.idFather) updates.idFather = data.idFather;
                                if (data.idProductiveStatus) updates.idProductiveStatus = data.idProductiveStatus;
                                await this.ranchAnimalRepository.update({ id: (animal as any).id }, updates);
                                return (animal as any).id;
                            });
                        }
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.executeInTransaction(async () => {
                            await this.ranchAnimalsService.update(op.serverId!, {
                                idRanch: data.idRanch,
                                idBreed: data.idBreed,
                                idStatus: data.idStatus,
                                idAnimalClass: data.idAnimalClass,
                                code: data.code,
                                sex: data.sex,
                                birthdate: data.birthdate,
                                weight: data.weight,
                                codeMother: data.codeMother,
                                codeFather: data.codeFather,
                                createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
                            }, RanchAnimalDto);
                        });
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        // Borrado lógico: marcar como inactivo (no existe remove físico en ranch animals por integridad)
                        await this.executeInTransaction(async () => {
                            await this.ranchAnimalRepository.update(
                                { id: op.serverId },
                                { idStatus: 3 }, // id_status = 3 = Inactivo
                            );
                        });
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('ranch_animal', op.localId, op.operation, error);
                results.push({
                    localId: op.localId,
                    status: 'failed',
                    error: this.extractErrorMessage(error),
                });
            }
        }

        return this.buildSectionResult(results);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Sección 4: Eventos de CRÍA
    //  Reutiliza los mismos use-cases del módulo breeding (no duplicamos lógica)
    // ─────────────────────────────────────────────────────────────────────────

    private async processBreedingEvents(
        operations: SyncBreedingEventOperationDto[],
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
                    // ── CREATE ────────────────────────────────────────────────
                    case 'create': {
                        serverId = await this.executeInTransaction(async () => {
                            let id: number | undefined;
                            switch (op.type) {
                                case 'breeding_service': {
                                    const result = await this.registerBreedingServiceUseCase.execute(
                                        { ...data, ...baseFields } as RegisterBreedingServiceDto,
                                    );
                                    id = result.id;
                                    break;
                                }
                                case 'gestation_diagnosis': {
                                    const result = await this.registerGestationDiagnosisUseCase.execute(
                                        { ...data, ...baseFields } as RegisterGestationDiagnosisDto,
                                    );
                                    id = result.id;
                                    break;
                                }
                                case 'parturition': {
                                    const result = await this.registerParturitionUseCase.execute(
                                        { ...data, ...baseFields } as RegisterParturitionDto,
                                    );
                                    id = result.id;
                                    break;
                                }
                                case 'weaning': {
                                    const result = await this.registerWeaningUseCase.execute(
                                        { ...data, ...baseFields } as RegisterWeaningDto,
                                    );
                                    id = result.id;
                                    break;
                                }
                                case 'animal_declared_history': {
                                    const result = await this.registerAnimalDeclaredHistoryUseCase.execute(
                                        { ...data } as RegisterAnimalDeclaredHistoryDto,
                                    );
                                    id = result.id;
                                    break;
                                }
                                default:
                                    throw new Error(`Tipo no soportado para create: ${(op as any).type}`);
                            }
                            return id!;
                        });
                        break;
                    }

                    // ── UPDATE ────────────────────────────────────────────────
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para update');
                        await this.executeInTransaction(async () => {
                            switch (op.type) {
                                case 'breeding_service':
                                    await this.updateBreedingServiceUseCase.execute(op.serverId!, data as UpdateBreedingServiceDto);
                                    break;
                                case 'gestation_diagnosis':
                                    await this.updateGestationDiagnosisUseCase.execute(op.serverId!, data as UpdateGestationDiagnosisDto);
                                    break;
                                case 'parturition':
                                    await this.updateParturitionUseCase.execute(op.serverId!, data as UpdateParturitionDto);
                                    break;
                                case 'weaning':
                                    await this.updateWeaningUseCase.execute(op.serverId!, data as UpdateWeaningDto);
                                    break;
                                case 'animal_declared_history':
                                    await this.updateAnimalDeclaredHistoryUseCase.execute(op.serverId!, data as UpdateAnimalDeclaredHistoryDto);
                                    break;
                                default:
                                    throw new Error(`Tipo no soportado para update: ${(op as any).type}`);
                            }
                        });
                        serverId = op.serverId;
                        break;
                    }

                    // ── DELETE ────────────────────────────────────────────────
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId es requerido para delete');
                        await this.executeInTransaction(async () => {
                            switch (op.type) {
                                case 'breeding_service':
                                    await this.deleteBreedingServiceUseCase.execute(op.serverId!);
                                    break;
                                case 'gestation_diagnosis':
                                    await this.deleteGestationDiagnosisUseCase.execute(op.serverId!);
                                    break;
                                case 'parturition':
                                    await this.deleteParturitionUseCase.execute(op.serverId!);
                                    break;
                                case 'weaning':
                                    await this.deleteWeaningUseCase.execute(op.serverId!);
                                    break;
                                case 'animal_declared_history':
                                    await this.deleteAnimalDeclaredHistoryUseCase.execute(op.serverId!);
                                    break;
                                default:
                                    throw new Error(`Tipo no soportado para delete: ${(op as any).type}`);
                            }
                        });
                        serverId = op.serverId;
                        break;
                    }

                    default:
                        throw new Error(`Operación no soportada: ${(op as any).operation}`);
                }

                if (serverId !== undefined) {
                    localIdToServerId.set(op.localId, serverId);
                }
                results.push({ localId: op.localId, status: 'success', serverId });
            } catch (error: any) {
                this.logOperationError(op.type ?? 'breeding_event', op.localId, op.operation, error);
                results.push({
                    localId: op.localId,
                    status: 'failed',
                    error: this.extractErrorMessage(error),
                });
            }
        }

        return this.buildSectionResult(results);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Helpers privados
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Ejecuta una función dentro de una transacción de base de datos.
     * Si la función lanza un error, la transacción se hace rollback automáticamente.
     * Si la función tiene éxito, se hace commit.
     * 
     * Esto garantiza atomicidad: o toda la operación se guarda o ninguna parte se guarda.
     */
    private async executeInTransaction<T>(
        fn: () => Promise<T>,
    ): Promise<T> {
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

    /**
     * Resuelve los campos `localRef_<campo>` de un payload, sustituyéndolos por el
     * ID real asignado por el servidor. Si un localRef no se puede resolver (la
     * operación de origen falló), el campo se omite — la validación del use-case
     * reportará el error adecuado.
     *
     * Ejemplo:
     *   input:  { "localRef_idRanchPasture": "uuid-pasture-1", "name": "Lote A" }
     *   output: { "idRanchPasture": 5, "name": "Lote A" }
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
                if (id !== undefined) {
                    resolved[targetField] = id;
                }
                // Si no se resuelve, se omite el campo intencionalmente
            } else {
                resolved[key] = value;
            }
        }
        return resolved;
    }

    /** Construye el resumen de una sección a partir de sus resultados individuales. */
    private buildSectionResult(results: SyncCriaOperationResultDto[]): SyncCriaSectionDto {
        return {
            succeeded: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
            results,
        };
    }

    /** Extrae el mensaje de error más descriptivo de una excepción. */
    private extractErrorMessage(error: any): string {
        // Intenta obtener el mensaje de diferentes fuentes, priorizando arrays de strings
        const msg = error?.response?.message;
        
        if (Array.isArray(msg) && msg.length > 0) {
            // Si es array, tomar el primer elemento completo
            return String(msg[0]);
        }
        
        return (
            msg ??
            error?.message ??
            'Error desconocido'
        );
    }

    /** Loguea el error de una operación con contexto completo. */
    private logOperationError(
        entity: string,
        localId: string,
        operation: string,
        error: any,
    ): void {
        this.logger.warn(
            `Sync CRÍA: operación localId="${localId}" entity="${entity}" op="${operation}" → ${error?.message ?? error}`,
        );
    }
}
