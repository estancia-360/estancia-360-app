import { Module } from '@nestjs/common';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { GestationDiagnosesModule } from 'src/modules/breeding-modules/gestation-diagnoses/gestation-diagnoses.module';
import { ParturitionsModule } from 'src/modules/breeding-modules/parturitions/parturitions.module';
import { BreedingServicesModule } from 'src/modules/breeding-modules/breeding-services/breeding-services.module';
import { RearingSelectionsModule } from 'src/modules/rearing-modules/rearing-selections/rearing-selections.module';
import { WeightRecordsModule } from 'src/modules/rearing-modules/weight-records/weight-records.module';
import { FatteningEntriesModule } from 'src/modules/fattening-modules/fattening-entries/fattening-entries.module';
import { FeedRecordsModule } from 'src/modules/fattening-modules/feed-records/feed-records.module';
import { TreatmentsModule } from 'src/modules/health-modules/treatments/treatments.module';
import { MovementsModule } from 'src/modules/movement-modules/movements/movements.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';
import { DashboardController } from './dashboard.controller';
import { GetDashboardStatsUseCase } from './use-cases/get-dashboard-stats.use-case';

@Module({
    imports: [
        RanchAnimalsModule,
        GestationDiagnosesModule,
        ParturitionsModule,
        BreedingServicesModule,
        RearingSelectionsModule,
        WeightRecordsModule,
        FatteningEntriesModule,
        FeedRecordsModule,
        TreatmentsModule,
        MovementsModule,
        RanchUsersModule,
    ],
    controllers: [DashboardController],
    providers: [GetDashboardStatsUseCase],
})
export class DashboardModule {}
