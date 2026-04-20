import { Module } from '@nestjs/common';
import { RearingService } from './rearing.service';
import { RearingController } from './rearing.controller';

import { RegisterWeightRecordUseCase } from './use-cases/register-weight-record.use-case';
import { UpdateWeightRecordUseCase } from './use-cases/update-weight-record.use-case';
import { DeleteWeightRecordUseCase } from './use-cases/delete-weight-record.use-case';
import { RegisterRearingSelectionUseCase } from './use-cases/register-rearing-selection.use-case';
import { UpdateRearingSelectionUseCase } from './use-cases/update-rearing-selection.use-case';
import { DeleteRearingSelectionUseCase } from './use-cases/delete-rearing-selection.use-case';

import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { AnimalEventsModule } from 'src/modules/ranch-management/animal-events/animal-events.module';
import { WeightRecordsModule } from 'src/modules/rearing-modules/weight-records/weight-records.module';
import { RearingSelectionsModule } from 'src/modules/rearing-modules/rearing-selections/rearing-selections.module';
import { FatteningEntriesModule } from 'src/modules/fattening-modules/fattening-entries/fattening-entries.module';

@Module({
    imports: [
        RanchAnimalsModule,
        AnimalEventsModule,
        WeightRecordsModule,
        RearingSelectionsModule,
        FatteningEntriesModule,
    ],
    controllers: [RearingController],
    providers: [
        RearingService,
        RegisterWeightRecordUseCase,
        UpdateWeightRecordUseCase,
        DeleteWeightRecordUseCase,
        RegisterRearingSelectionUseCase,
        UpdateRearingSelectionUseCase,
        DeleteRearingSelectionUseCase,
    ],
    exports: [
        RegisterWeightRecordUseCase,
        UpdateWeightRecordUseCase,
        DeleteWeightRecordUseCase,
        RegisterRearingSelectionUseCase,
        UpdateRearingSelectionUseCase,
        DeleteRearingSelectionUseCase,
    ],
})
export class RearingModule {}
