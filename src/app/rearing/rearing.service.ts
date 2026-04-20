import { Injectable } from '@nestjs/common';
import { RegisterWeightRecordDto } from './dto/inputs/register-weight-record.dto';
import { UpdateWeightRecordDto } from './dto/inputs/update-weight-record.dto';
import { RegisterRearingSelectionDto } from './dto/inputs/register-rearing-selection.dto';
import { UpdateRearingSelectionDto } from './dto/inputs/update-rearing-selection.dto';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';
import { RegisterWeightRecordUseCase } from './use-cases/register-weight-record.use-case';
import { UpdateWeightRecordUseCase } from './use-cases/update-weight-record.use-case';
import { DeleteWeightRecordUseCase } from './use-cases/delete-weight-record.use-case';
import { RegisterRearingSelectionUseCase } from './use-cases/register-rearing-selection.use-case';
import { UpdateRearingSelectionUseCase } from './use-cases/update-rearing-selection.use-case';
import { DeleteRearingSelectionUseCase } from './use-cases/delete-rearing-selection.use-case';

@Injectable()
export class RearingService {
    constructor(
        private readonly registerWeightRecordUseCase: RegisterWeightRecordUseCase,
        private readonly updateWeightRecordUseCase: UpdateWeightRecordUseCase,
        private readonly deleteWeightRecordUseCase: DeleteWeightRecordUseCase,
        private readonly registerRearingSelectionUseCase: RegisterRearingSelectionUseCase,
        private readonly updateRearingSelectionUseCase: UpdateRearingSelectionUseCase,
        private readonly deleteRearingSelectionUseCase: DeleteRearingSelectionUseCase,
    ) {}

    registerWeightRecord(dto: RegisterWeightRecordDto): Promise<WeightRecordDto> {
        return this.registerWeightRecordUseCase.execute(dto);
    }

    updateWeightRecord(id: number, dto: UpdateWeightRecordDto): Promise<WeightRecordDto> {
        return this.updateWeightRecordUseCase.execute(id, dto);
    }

    deleteWeightRecord(id: number): Promise<void> {
        return this.deleteWeightRecordUseCase.execute(id);
    }

    registerRearingSelection(dto: RegisterRearingSelectionDto): Promise<RearingSelectionDto> {
        return this.registerRearingSelectionUseCase.execute(dto);
    }

    updateRearingSelection(id: number, dto: UpdateRearingSelectionDto): Promise<RearingSelectionDto> {
        return this.updateRearingSelectionUseCase.execute(id, dto);
    }

    deleteRearingSelection(id: number): Promise<void> {
        return this.deleteRearingSelectionUseCase.execute(id);
    }
}
