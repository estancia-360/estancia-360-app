import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
    SyncCriaDto,
    SyncRanchPastureOperationDto,
    SyncRanchLotOperationDto,
    SyncRanchAnimalOperationDto,
    SyncBreedingServiceOperationDto,
    SyncGestationDiagnosisOperationDto,
    SyncParturitionOperationDto,
    SyncWeaningOperationDto,
    SyncAnimalDeclaredHistoryOperationDto,
} from '../dto/inputs/sync-cria.dto';
import { SyncCriaResponseDto } from '../dto/outputs/sync-cria-response.dto';
import { SyncSectionDto, SyncOperationResultDto } from '../dto/outputs/sync-common.dto';

import { RanchPasture } from 'src/modules/ranch-management/ranch-pastures/entities/ranch-pasture.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

import { RanchPasturesService } from 'src/modules/ranch-management/ranch-pastures/services/ranch-pastures.service';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal.dto';

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

/**
 * Orchestrates POST /sync/cria. Each entity type reuses the SAME register/
 * update/delete use-case that backs the live (online) endpoint — this file
 * only resolves ordering, localRef_<field> cross-references, and per-op
 * idempotency-by-localId for the two entity types (pastures/lots/animals)
 * that don't already have it built into their service.
 */
@Injectable()
export class SyncCriaBatchUseCase {
    private readonly logger = new Logger(SyncCriaBatchUseCase.name);

    constructor(
        @InjectRepository(RanchPasture) private readonly ranchPastureRepository: Repository<RanchPasture>,
        @InjectRepository(RanchLot) private readonly ranchLotRepository: Repository<RanchLot>,
        @InjectRepository(RanchAnimal) private readonly ranchAnimalRepository: Repository<RanchAnimal>,

        private readonly ranchPasturesService: RanchPasturesService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly ranchAnimalsService: RanchAnimalsService,

        private readonly registerBreedingServiceUseCase: RegisterBreedingServiceUseCase,
        private readonly registerGestationDiagnosisUseCase: RegisterGestationDiagnosisUseCase,
        private readonly registerParturitionUseCase: RegisterParturitionUseCase,
        private readonly registerWeaningUseCase: RegisterWeaningUseCase,
        private readonly registerAnimalDeclaredHistoryUseCase: RegisterAnimalDeclaredHistoryUseCase,

        private readonly updateBreedingServiceUseCase: UpdateBreedingServiceUseCase,
        private readonly updateGestationDiagnosisUseCase: UpdateGestationDiagnosisUseCase,
        private readonly updateParturitionUseCase: UpdateParturitionUseCase,
        private readonly updateWeaningUseCase: UpdateWeaningUseCase,
        private readonly updateAnimalDeclaredHistoryUseCase: UpdateAnimalDeclaredHistoryUseCase,

        private readonly deleteBreedingServiceUseCase: DeleteBreedingServiceUseCase,
        private readonly deleteGestationDiagnosisUseCase: DeleteGestationDiagnosisUseCase,
        private readonly deleteParturitionUseCase: DeleteParturitionUseCase,
        private readonly deleteWeaningUseCase: DeleteWeaningUseCase,
        private readonly deleteAnimalDeclaredHistoryUseCase: DeleteAnimalDeclaredHistoryUseCase,
    ) {}

    async execute(dto: SyncCriaDto, idUser: number): Promise<SyncCriaResponseDto> {
        const localIdToServerId = new Map<string, number>();

        const ranchPastures = await this.processRanchPastures(dto.ranchPastures ?? [], dto.idRanch, localIdToServerId);
        const ranchLots = await this.processRanchLots(dto.ranchLots ?? [], dto.idRanch, localIdToServerId);
        const ranchAnimals = await this.processRanchAnimals(dto.ranchAnimals ?? [], dto.idRanch, localIdToServerId);
        const breedingServices = await this.processBreedingServices(dto.breedingServices ?? [], localIdToServerId, idUser);
        const gestationDiagnoses = await this.processGestationDiagnoses(dto.gestationDiagnoses ?? [], localIdToServerId, idUser);
        const parturitions = await this.processParturitions(dto.parturitions ?? [], localIdToServerId, idUser);
        const weanings = await this.processWeanings(dto.weanings ?? [], localIdToServerId, idUser);
        const animalDeclaredHistories = await this.processAnimalDeclaredHistories(dto.animalDeclaredHistories ?? [], localIdToServerId, idUser);

        const sections = [ranchPastures, ranchLots, ranchAnimals, breedingServices, gestationDiagnoses, parturitions, weanings, animalDeclaredHistories];

        return {
            totalSucceeded: sections.reduce((sum, s) => sum + s.succeeded, 0),
            totalFailed: sections.reduce((sum, s) => sum + s.failed, 0),
            ranchPastures,
            ranchLots,
            ranchAnimals,
            breedingServices,
            gestationDiagnoses,
            parturitions,
            weanings,
            animalDeclaredHistories,
        };
    }

    private async processRanchPastures(
        operations: SyncRanchPastureOperationDto[],
        idRanch: number,
        localIdToServerId: Map<string, number>,
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number;

                switch (op.operation) {
                    case 'create': {
                        const existing = await this.ranchPastureRepository.findOne({ where: { localId: op.localId } });
                        if (existing) {
                            serverId = Number(existing.id);
                        } else {
                            const pasture = await this.ranchPasturesService.create({
                                idRanch,
                                name: data.name,
                                areaHectares: data.areaHectares,
                                description: data.description,
                                isActive: data.isActive ?? true,
                            });
                            await this.ranchPastureRepository.update({ id: pasture.id }, { localId: op.localId });
                            serverId = Number(pasture.id);
                        }
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.ranchPasturesService.update(op.serverId, {
                            name: data.name,
                            areaHectares: data.areaHectares,
                            description: data.description,
                            isActive: data.isActive,
                        });
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.ranchPasturesService.remove(op.serverId);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('ranch_pasture', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    private async processRanchLots(
        operations: SyncRanchLotOperationDto[],
        idRanch: number,
        localIdToServerId: Map<string, number>,
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number;

                switch (op.operation) {
                    case 'create': {
                        const existing = await this.ranchLotRepository.findOne({ where: { localId: op.localId } });
                        if (existing) {
                            serverId = Number(existing.id);
                        } else {
                            const lot = await this.ranchLotsService.create({
                                idRanch,
                                idRanchPasture: data.idRanchPasture,
                                name: data.name,
                                lotType: data.lotType,
                                capacity: data.capacity,
                            });
                            await this.ranchLotRepository.update({ id: lot.id }, { localId: op.localId });
                            serverId = Number(lot.id);
                        }
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.ranchLotsService.update(op.serverId, {
                            name: data.name,
                            lotType: data.lotType,
                            capacity: data.capacity,
                        });
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.ranchLotsService.remove(op.serverId);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('ranch_lot', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    // BUG-03 / BUG-04 (auditoria QA E2E, 2026-09-03): a diferencia de processRanchPastures/
    // processRanchLots (arriba), este bloque tomaba el idRanch de cada fila del cliente
    // (`data.idRanch`) en vez del idRanch del batch ya validado contra el usuario autenticado
    // — permitia crear/editar/borrar animales de OTRA estancia con solo mandar un idRanch o
    // serverId ajeno en el payload. La busqueda de idempotencia por localId tampoco filtraba
    // por estancia, así que un localId repetido entre dos estancias distintas (colision, no
    // necesariamente maliciosa) hacia que la segunda estancia "heredara" en silencio el
    // serverId del animal de la primera, sin escribir nada propio ni avisar del choque.
    private async processRanchAnimals(
        operations: SyncRanchAnimalOperationDto[],
        idRanch: number,
        localIdToServerId: Map<string, number>,
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number;

                switch (op.operation) {
                    case 'create': {
                        const existing = await this.ranchAnimalRepository.findOne({ where: { localId: op.localId, idRanch } });
                        if (existing) {
                            serverId = Number(existing.id);
                        } else {
                            const animal: any = await this.ranchAnimalsService.create(
                                {
                                    idRanch,
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
                            const updates: Partial<RanchAnimal> = { localId: op.localId };
                            if (data.origin) updates.origin = data.origin;
                            if (data.idMother) updates.idMother = data.idMother;
                            if (data.idFather) updates.idFather = data.idFather;
                            if (data.idProductiveStatus) updates.idProductiveStatus = data.idProductiveStatus;
                            if (data.idLot) updates.idLot = data.idLot;
                            await this.ranchAnimalRepository.update({ id: animal.id }, updates);
                            serverId = animal.id;
                        }
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        const target = await this.ranchAnimalRepository.findOne({ where: { id: op.serverId } });
                        if (!target || target.idRanch !== idRanch) {
                            throw new BadRequestException(`Animal ID=${op.serverId} does not belong to ranch ID=${idRanch}.`);
                        }
                        await this.ranchAnimalsService.update(
                            op.serverId,
                            {
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
                                idLot: data.idLot,
                            },
                            RanchAnimalDto,
                        );
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        const target = await this.ranchAnimalRepository.findOne({ where: { id: op.serverId } });
                        if (!target || target.idRanch !== idRanch) {
                            throw new BadRequestException(`Animal ID=${op.serverId} does not belong to ranch ID=${idRanch}.`);
                        }
                        await this.ranchAnimalRepository.update({ id: op.serverId }, { idStatus: 3 });
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('ranch_animal', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    private async processBreedingServices(
        operations: SyncBreedingServiceOperationDto[],
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
                        const result = await this.registerBreedingServiceUseCase.execute(
                            { ...data, ...baseFields, localId: op.localId } as RegisterBreedingServiceDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateBreedingServiceUseCase.execute(op.serverId, data as UpdateBreedingServiceDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteBreedingServiceUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('breeding_service', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    private async processGestationDiagnoses(
        operations: SyncGestationDiagnosisOperationDto[],
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
                        const result = await this.registerGestationDiagnosisUseCase.execute(
                            { ...data, ...baseFields, localId: op.localId } as RegisterGestationDiagnosisDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateGestationDiagnosisUseCase.execute(op.serverId, data as UpdateGestationDiagnosisDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteGestationDiagnosisUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('gestation_diagnosis', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    private async processParturitions(
        operations: SyncParturitionOperationDto[],
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
                        const result = await this.registerParturitionUseCase.execute(
                            { ...data, ...baseFields, localId: op.localId } as RegisterParturitionDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateParturitionUseCase.execute(op.serverId, data as UpdateParturitionDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteParturitionUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('parturition', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    private async processWeanings(
        operations: SyncWeaningOperationDto[],
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
                        const result = await this.registerWeaningUseCase.execute(
                            { ...data, ...baseFields, localId: op.localId } as RegisterWeaningDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateWeaningUseCase.execute(op.serverId, data as UpdateWeaningDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteWeaningUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('weaning', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    private async processAnimalDeclaredHistories(
        operations: SyncAnimalDeclaredHistoryOperationDto[],
        localIdToServerId: Map<string, number>,
        idUser: number,
    ): Promise<SyncSectionDto> {
        const results: SyncOperationResultDto[] = [];

        for (const op of operations) {
            try {
                const data = this.resolveLocalRefs(op.data, localIdToServerId);
                let serverId: number | undefined;

                switch (op.operation) {
                    case 'create': {
                        const result = await this.registerAnimalDeclaredHistoryUseCase.execute(
                            { ...data, localId: op.localId } as RegisterAnimalDeclaredHistoryDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateAnimalDeclaredHistoryUseCase.execute(op.serverId, data as UpdateAnimalDeclaredHistoryDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteAnimalDeclaredHistoryUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logOperationError('animal_declared_history', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractErrorMessage(error) });
            }
        }

        return this.buildSectionResult(results);
    }

    private resolveLocalRefs(data: Record<string, any>, localIdToServerId: Map<string, number>): Record<string, any> {
        const resolved: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('localRef_')) {
                const targetField = key.replace('localRef_', '');
                const id = localIdToServerId.get(value as string);
                if (id === undefined) {
                    throw new BadRequestException(`localRef_${targetField}="${value}" does not match any localId registered earlier in this batch`);
                }
                resolved[targetField] = id;
            } else {
                resolved[key] = value;
            }
        }
        return resolved;
    }

    private buildSectionResult(results: SyncOperationResultDto[]): SyncSectionDto {
        return {
            succeeded: results.filter((r) => r.status === 'success').length,
            failed: results.filter((r) => r.status === 'failed').length,
            results,
        };
    }

    private extractErrorMessage(error: any): string {
        const msg = error?.response?.message;
        if (Array.isArray(msg) && msg.length > 0) return String(msg[0]);
        return msg ?? error?.message ?? 'Unknown error';
    }

    private logOperationError(entity: string, localId: string, operation: string, error: any): void {
        this.logger.warn(`Sync CRÍA: localId="${localId}" entity="${entity}" op="${operation}" → ${error?.message ?? error}`);
    }
}
