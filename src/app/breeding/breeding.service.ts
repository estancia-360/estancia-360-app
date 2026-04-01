import { Injectable } from '@nestjs/common';
import { RegisterBreedingServiceDto } from './dto/inputs/register-breeding-service.dto';
import { RegisterGestationDiagnosisDto } from './dto/inputs/register-gestation-diagnosis.dto';
import { RegisterParturitionDto } from './dto/inputs/register-parturition.dto';
import { RegisterWeaningDto } from './dto/inputs/register-weaning.dto';
import { SyncBreedingDto } from './dto/inputs/sync-breeding.dto';
import { SyncBreedingResponseDto } from './dto/outputs/sync-breeding-response.dto';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';

// Register use-cases
import { RegisterBreedingServiceUseCase } from './use-cases/register-breeding-service.use-case';
import { RegisterGestationDiagnosisUseCase } from './use-cases/register-gestation-diagnosis.use-case';
import { RegisterParturitionUseCase } from './use-cases/register-parturition.use-case';
import { RegisterWeaningUseCase } from './use-cases/register-weaning.use-case';
import { SyncBreedingBatchUseCase } from './use-cases/sync-breeding-batch.use-case';
import { RegisterAnimalDeclaredHistoryUseCase } from './use-cases/register-animal-declared-history.use-case';
import { RegisterAnimalDeclaredHistoryDto } from './dto/inputs/register-animal-declared-history.dto';

// Update use-cases
import { UpdateBreedingServiceUseCase } from './use-cases/update-breeding-service.use-case';
import { UpdateGestationDiagnosisUseCase } from './use-cases/update-gestation-diagnosis.use-case';
import { UpdateParturitionUseCase } from './use-cases/update-parturition.use-case';
import { UpdateWeaningUseCase } from './use-cases/update-weaning.use-case';
import { UpdateAnimalDeclaredHistoryUseCase } from './use-cases/update-animal-declared-history.use-case';
import { UpdateBreedingServiceDto } from './dto/inputs/update-breeding-service.dto';
import { UpdateGestationDiagnosisDto } from './dto/inputs/update-gestation-diagnosis.dto';
import { UpdateParturitionDto } from './dto/inputs/update-parturition.dto';
import { UpdateWeaningDto } from './dto/inputs/update-weaning.dto';
import { UpdateAnimalDeclaredHistoryDto } from './dto/inputs/update-animal-declared-history.dto';

// Delete use-cases
import { DeleteBreedingServiceUseCase } from './use-cases/delete-breeding-service.use-case';
import { DeleteGestationDiagnosisUseCase } from './use-cases/delete-gestation-diagnosis.use-case';
import { DeleteParturitionUseCase } from './use-cases/delete-parturition.use-case';
import { DeleteWeaningUseCase } from './use-cases/delete-weaning.use-case';
import { DeleteAnimalDeclaredHistoryUseCase } from './use-cases/delete-animal-declared-history.use-case';

@Injectable()
export class BreedingService {
    constructor(
        // Register
        private readonly registerBreedingServiceUseCase: RegisterBreedingServiceUseCase,
        private readonly registerGestationDiagnosisUseCase: RegisterGestationDiagnosisUseCase,
        private readonly registerParturitionUseCase: RegisterParturitionUseCase,
        private readonly registerWeaningUseCase: RegisterWeaningUseCase,
        private readonly syncBreedingBatchUseCase: SyncBreedingBatchUseCase,
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

    // ─────────────────────────────────────────────────────────────
    //  REGISTER
    // ─────────────────────────────────────────────────────────────

    async registerBreedingService(dto: RegisterBreedingServiceDto): Promise<BreedingServiceDto> {
        return this.registerBreedingServiceUseCase.execute(dto);
    }

    async registerGestationDiagnosis(dto: RegisterGestationDiagnosisDto): Promise<GestationDiagnosisDto> {
        return this.registerGestationDiagnosisUseCase.execute(dto);
    }

    async registerParturition(dto: RegisterParturitionDto): Promise<ParturitionDto> {
        return this.registerParturitionUseCase.execute(dto);
    }

    async registerWeaning(dto: RegisterWeaningDto): Promise<WeaningDto> {
        return this.registerWeaningUseCase.execute(dto);
    }

    async registerAnimalDeclaredHistory(dto: RegisterAnimalDeclaredHistoryDto): Promise<AnimalDeclaredHistoryDto> {
        return this.registerAnimalDeclaredHistoryUseCase.execute(dto);
    }

    async syncBatch(dto: SyncBreedingDto): Promise<SyncBreedingResponseDto> {
        return this.syncBreedingBatchUseCase.execute(dto);
    }

    // ─────────────────────────────────────────────────────────────
    //  UPDATE
    // ─────────────────────────────────────────────────────────────

    async updateBreedingService(id: number, dto: UpdateBreedingServiceDto): Promise<BreedingServiceDto> {
        return this.updateBreedingServiceUseCase.execute(id, dto);
    }

    async updateGestationDiagnosis(id: number, dto: UpdateGestationDiagnosisDto): Promise<GestationDiagnosisDto> {
        return this.updateGestationDiagnosisUseCase.execute(id, dto);
    }

    async updateParturition(id: number, dto: UpdateParturitionDto): Promise<ParturitionDto> {
        return this.updateParturitionUseCase.execute(id, dto);
    }

    async updateWeaning(id: number, dto: UpdateWeaningDto): Promise<WeaningDto> {
        return this.updateWeaningUseCase.execute(id, dto);
    }

    async updateAnimalDeclaredHistory(id: number, dto: UpdateAnimalDeclaredHistoryDto): Promise<AnimalDeclaredHistoryDto> {
        return this.updateAnimalDeclaredHistoryUseCase.execute(id, dto);
    }

    // ─────────────────────────────────────────────────────────────
    //  DELETE
    // ─────────────────────────────────────────────────────────────

    async deleteBreedingService(id: number): Promise<void> {
        return this.deleteBreedingServiceUseCase.execute(id);
    }

    async deleteGestationDiagnosis(id: number): Promise<void> {
        return this.deleteGestationDiagnosisUseCase.execute(id);
    }

    async deleteParturition(id: number): Promise<void> {
        return this.deleteParturitionUseCase.execute(id);
    }

    async deleteWeaning(id: number): Promise<void> {
        return this.deleteWeaningUseCase.execute(id);
    }

    async deleteAnimalDeclaredHistory(id: number): Promise<void> {
        return this.deleteAnimalDeclaredHistoryUseCase.execute(id);
    }
}
