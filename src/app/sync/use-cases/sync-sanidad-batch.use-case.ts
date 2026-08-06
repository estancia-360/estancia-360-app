import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
    SyncSanidadDto,
    SyncVaccinationOperationDto,
    SyncTreatmentOperationDto,
    SyncHealthIncidentOperationDto,
} from '../dto/inputs/sync-sanidad.dto';
import { SyncSanidadResponseDto } from '../dto/outputs/sync-sanidad-response.dto';
import { SyncSectionDto, SyncOperationResultDto } from '../dto/outputs/sync-common.dto';
import { RegisterVaccinationUseCase } from 'src/app/animal-health/use-cases/register-vaccination.use-case';
import { UpdateVaccinationUseCase } from 'src/app/animal-health/use-cases/update-vaccination.use-case';
import { DeleteVaccinationUseCase } from 'src/app/animal-health/use-cases/delete-vaccination.use-case';
import { RegisterTreatmentUseCase } from 'src/app/animal-health/use-cases/register-treatment.use-case';
import { UpdateTreatmentUseCase } from 'src/app/animal-health/use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from 'src/app/animal-health/use-cases/delete-treatment.use-case';
import { RegisterHealthIncidentUseCase } from 'src/app/animal-health/use-cases/register-health-incident.use-case';
import { UpdateHealthIncidentUseCase } from 'src/app/animal-health/use-cases/update-health-incident.use-case';
import { DeleteHealthIncidentUseCase } from 'src/app/animal-health/use-cases/delete-health-incident.use-case';
import { RegisterVaccinationDto } from 'src/app/animal-health/dto/inputs/register-vaccination.dto';
import { UpdateVaccinationDto } from 'src/app/animal-health/dto/inputs/update-vaccination.dto';
import { RegisterTreatmentDto } from 'src/app/animal-health/dto/inputs/register-treatment.dto';
import { UpdateTreatmentDto } from 'src/app/animal-health/dto/inputs/update-treatment.dto';
import { RegisterHealthIncidentDto } from 'src/app/animal-health/dto/inputs/register-health-incident.dto';
import { UpdateHealthIncidentDto } from 'src/app/animal-health/dto/inputs/update-health-incident.dto';

@Injectable()
export class SyncSanidadBatchUseCase {
    private readonly logger = new Logger(SyncSanidadBatchUseCase.name);

    constructor(
        private readonly registerVaccinationUseCase: RegisterVaccinationUseCase,
        private readonly updateVaccinationUseCase: UpdateVaccinationUseCase,
        private readonly deleteVaccinationUseCase: DeleteVaccinationUseCase,
        private readonly registerTreatmentUseCase: RegisterTreatmentUseCase,
        private readonly updateTreatmentUseCase: UpdateTreatmentUseCase,
        private readonly deleteTreatmentUseCase: DeleteTreatmentUseCase,
        private readonly registerHealthIncidentUseCase: RegisterHealthIncidentUseCase,
        private readonly updateHealthIncidentUseCase: UpdateHealthIncidentUseCase,
        private readonly deleteHealthIncidentUseCase: DeleteHealthIncidentUseCase,
    ) {}

    async execute(dto: SyncSanidadDto, idUser: number): Promise<SyncSanidadResponseDto> {
        const localIdToServerId = new Map<string, number>();

        const vaccinations = await this.processVaccinations(dto.vaccinations ?? [], localIdToServerId, idUser);
        const treatments = await this.processTreatments(dto.treatments ?? [], localIdToServerId, idUser);
        const healthIncidents = await this.processHealthIncidents(dto.healthIncidents ?? [], localIdToServerId, idUser);

        return {
            totalSucceeded: vaccinations.succeeded + treatments.succeeded + healthIncidents.succeeded,
            totalFailed: vaccinations.failed + treatments.failed + healthIncidents.failed,
            vaccinations,
            treatments,
            healthIncidents,
        };
    }

    private async processVaccinations(
        operations: SyncVaccinationOperationDto[],
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
                        const result = await this.registerVaccinationUseCase.execute(
                            { ...data, eventDate: op.happenedAt as unknown as Date, isSynced: true, localId: op.localId } as RegisterVaccinationDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateVaccinationUseCase.execute(op.serverId, data as UpdateVaccinationDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteVaccinationUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('vaccination', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }

        return this.buildSection(results);
    }

    private async processTreatments(
        operations: SyncTreatmentOperationDto[],
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
                        const result = await this.registerTreatmentUseCase.execute(
                            { ...data, eventDate: op.happenedAt as unknown as Date, isSynced: true, localId: op.localId } as RegisterTreatmentDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateTreatmentUseCase.execute(op.serverId, data as UpdateTreatmentDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteTreatmentUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('treatment', op.localId, op.operation, error);
                results.push({ localId: op.localId, status: 'failed', error: this.extractMessage(error) });
            }
        }

        return this.buildSection(results);
    }

    private async processHealthIncidents(
        operations: SyncHealthIncidentOperationDto[],
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
                        const result = await this.registerHealthIncidentUseCase.execute(
                            { ...data, eventDate: op.happenedAt as unknown as Date, isSynced: true, localId: op.localId } as RegisterHealthIncidentDto,
                            idUser,
                        );
                        serverId = result.id;
                        break;
                    }
                    case 'update': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for update');
                        await this.updateHealthIncidentUseCase.execute(op.serverId, data as UpdateHealthIncidentDto, idUser);
                        serverId = op.serverId;
                        break;
                    }
                    case 'delete': {
                        if (!op.serverId) throw new BadRequestException('serverId is required for delete');
                        await this.deleteHealthIncidentUseCase.execute(op.serverId, idUser);
                        serverId = op.serverId;
                        break;
                    }
                }

                localIdToServerId.set(op.localId, serverId!);
                results.push({ localId: op.localId, status: 'success', serverId: serverId! });
            } catch (error: any) {
                this.logError('health_incident', op.localId, op.operation, error);
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
        this.logger.warn(`Sync SANIDAD: localId="${localId}" entity="${entity}" op="${operation}" → ${error?.message ?? error}`);
    }
}
