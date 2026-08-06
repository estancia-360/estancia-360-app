import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { RearingSelectionsService } from 'src/modules/rearing-modules/rearing-selections/services/rearing-selections.service';
import { WeightRecordsService } from 'src/modules/rearing-modules/weight-records/services/weight-records.service';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { FeedRecordsService } from 'src/modules/fattening-modules/feed-records/services/feed-records.service';
import { TreatmentsService } from 'src/modules/health-modules/treatments/services/treatments.service';
import { MovementsService } from 'src/modules/movement-modules/movements/services/movements.service';
import { PRODUCTIVE_STATUS_IDS, ANIMAL_STATUS_IDS } from 'src/shared/constants';
import { MovementTypeEnum } from 'src/modules/movement-modules/movements/entities/movement.entity';
import { DashboardStatsDto } from '../dto/outputs/dashboard-stats.dto';

const TRENDS_MONTHS_BACK = 6;

/** Oldest → newest "YYYY-MM" labels for the last `count` calendar months, current month included. */
function lastMonthLabels(count: number): string[] {
    const now = new Date();
    const labels: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return labels;
}

@Injectable()
export class GetDashboardStatsUseCase {
    constructor(
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly parturitionsService: ParturitionsService,
        private readonly breedingServicesService: BreedingServicesService,
        private readonly rearingSelectionsService: RearingSelectionsService,
        private readonly weightRecordsService: WeightRecordsService,
        private readonly fatteningEntriesService: FatteningEntriesService,
        private readonly feedRecordsService: FeedRecordsService,
        private readonly treatmentsService: TreatmentsService,
        private readonly movementsService: MovementsService,
    ) {}

    async execute(idRanch: number): Promise<DashboardStatsDto> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const trendsSince = new Date(now.getFullYear(), now.getMonth() - (TRENDS_MONTHS_BACK - 1), 1);
        const monthLabels = lastMonthLabels(TRENDS_MONTHS_BACK);

        const [
            totalActive,
            criaCount,
            recriaCount,
            engordeCount,
            quarantineCount,
            activeWithdrawalCount,
            pendingSalesCount,
            activePregnancies,
            birthsLast30Days,
            monthlyMovements,
            rearingAvgWeight,
            fatteningAvgWeight,
            birthsByMonth,
            movementsByMonth,
            servicesByMonthRaw,
            diagnosisResults,
            selectionBreakdown,
            rearingWeightTrendRaw,
            fatteningWeightTrendRaw,
            systemBreakdown,
            feedCostByMonthRaw,
        ] = await Promise.all([
            this.ranchAnimalsService.countActiveByRanch(idRanch),
            this.ranchAnimalsService.countByProductiveStatus(idRanch, PRODUCTIVE_STATUS_IDS.CRIA),
            this.ranchAnimalsService.countByProductiveStatus(idRanch, PRODUCTIVE_STATUS_IDS.RECRIA),
            this.ranchAnimalsService.countByProductiveStatus(idRanch, PRODUCTIVE_STATUS_IDS.ENGORDE),
            this.ranchAnimalsService.countByStatus(idRanch, ANIMAL_STATUS_IDS.OBSERVATION),
            this.treatmentsService.countActiveWithdrawalsByRanch(idRanch),
            this.movementsService.countPendingSales(idRanch),
            this.gestationDiagnosesService.countActivePregnanciesByRanch(idRanch),
            this.parturitionsService.countRecentByRanch(idRanch, thirtyDaysAgo),
            this.movementsService.getMonthlyStats(idRanch, monthStart, monthEnd),
            this.ranchAnimalsService.avgWeightByProductiveStatus(idRanch, PRODUCTIVE_STATUS_IDS.RECRIA),
            this.ranchAnimalsService.avgWeightByProductiveStatus(idRanch, PRODUCTIVE_STATUS_IDS.ENGORDE),
            this.parturitionsService.countByMonthByRanch(idRanch, trendsSince),
            this.movementsService.getMonthlyTrend(idRanch, trendsSince),
            this.breedingServicesService.countByMonthByRanch(idRanch, trendsSince),
            this.gestationDiagnosesService.countResultsByRanch(idRanch, trendsSince),
            this.rearingSelectionsService.countByDestinationByRanch(idRanch),
            this.weightRecordsService.monthlyStatsByProductiveStatus(idRanch, PRODUCTIVE_STATUS_IDS.RECRIA, trendsSince),
            this.weightRecordsService.monthlyStatsByProductiveStatus(idRanch, PRODUCTIVE_STATUS_IDS.ENGORDE, trendsSince),
            this.fatteningEntriesService.countBySystemTypeByRanch(idRanch),
            this.feedRecordsService.costByMonthByRanch(idRanch, trendsSince),
        ]);

        const births = monthLabels.map((month) => ({
            month,
            count: birthsByMonth.find((r) => r.month === month)?.count ?? 0,
        }));

        const movementsTrend = monthLabels.map((month) => {
            const sales = movementsByMonth.find((r) => r.month === month && r.movementType === MovementTypeEnum.SALE);
            const purchases = movementsByMonth.find((r) => r.month === month && r.movementType === MovementTypeEnum.PURCHASE);
            return {
                month,
                salesCount: sales?.count ?? 0,
                salesAmount: sales?.amount ?? 0,
                purchasesCount: purchases?.count ?? 0,
                purchasesAmount: purchases?.amount ?? 0,
            };
        });

        const servicesByMonth = monthLabels.map((month) => ({
            month,
            count: servicesByMonthRaw.find((r) => r.month === month)?.count ?? 0,
        }));

        const rearingWeightTrend = monthLabels.map((month) => {
            const row = rearingWeightTrendRaw.find((r) => r.month === month);
            return { month, count: row?.count ?? 0, avgWeight: row?.avgWeight ?? null };
        });

        const fatteningWeightTrend = monthLabels.map((month) => {
            const row = fatteningWeightTrendRaw.find((r) => r.month === month);
            return { month, count: row?.count ?? 0, avgWeight: row?.avgWeight ?? null };
        });

        const feedCostByMonth = monthLabels.map((month) => ({
            month,
            cost: feedCostByMonthRaw.find((r) => r.month === month)?.cost ?? 0,
        }));

        return plainToInstance(
            DashboardStatsDto,
            {
                idRanch,
                herd: { totalActive, criaCount, recriaCount, engordeCount },
                alerts: { quarantineCount, activeWithdrawalCount, pendingSalesCount },
                movements: {
                    salesCountThisMonth: monthlyMovements.salesCount,
                    salesAmountThisMonth: monthlyMovements.salesAmount,
                    purchasesCountThisMonth: monthlyMovements.purchasesCount,
                    purchasesAmountThisMonth: monthlyMovements.purchasesAmount,
                },
                breeding: { activePregnancies, birthsLast30Days, servicesByMonth, diagnosisResults },
                rearing: {
                    activeCount: recriaCount,
                    avgWeight: rearingAvgWeight,
                    selectionBreakdown,
                    weightTrend: rearingWeightTrend,
                },
                fattening: {
                    activeCount: engordeCount,
                    avgWeight: fatteningAvgWeight,
                    systemBreakdown,
                    weightTrend: fatteningWeightTrend,
                    feedCostByMonth,
                },
                trends: { births, movements: movementsTrend },
            },
            { excludeExtraneousValues: true },
        );
    }
}
