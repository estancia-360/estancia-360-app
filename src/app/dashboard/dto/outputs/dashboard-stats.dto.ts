import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class DashboardHerdDto {
    @ApiProperty({ example: 42 })
    @Expose()
    @Type(() => Number)
    totalActive: number;

    @ApiProperty({ example: 10 })
    @Expose()
    @Type(() => Number)
    criaCount: number;

    @ApiProperty({ example: 18 })
    @Expose()
    @Type(() => Number)
    recriaCount: number;

    @ApiProperty({ example: 14 })
    @Expose()
    @Type(() => Number)
    engordeCount: number;
}

export class DashboardAlertsDto {
    @ApiProperty({ example: 2 })
    @Expose()
    @Type(() => Number)
    quarantineCount: number;

    @ApiProperty({ example: 3 })
    @Expose()
    @Type(() => Number)
    activeWithdrawalCount: number;

    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    pendingSalesCount: number;
}

export class DashboardMovementsDto {
    @ApiProperty({ example: 5 })
    @Expose()
    @Type(() => Number)
    salesCountThisMonth: number;

    @ApiProperty({ example: 12500 })
    @Expose()
    @Type(() => Number)
    salesAmountThisMonth: number;

    @ApiProperty({ example: 3 })
    @Expose()
    @Type(() => Number)
    purchasesCountThisMonth: number;

    @ApiProperty({ example: 8000 })
    @Expose()
    @Type(() => Number)
    purchasesAmountThisMonth: number;
}

export class DashboardMonthlyBirthDto {
    @ApiProperty({ example: '2026-03' })
    @Expose()
    month: string;

    @ApiProperty({ example: 2 })
    @Expose()
    @Type(() => Number)
    count: number;
}

export class DashboardDiagnosisResultsDto {
    @ApiProperty({ example: 4 })
    @Expose()
    @Type(() => Number)
    pregnant: number;

    @ApiProperty({ example: 2 })
    @Expose()
    @Type(() => Number)
    empty: number;
}

export class DashboardBreedingDto {
    @ApiProperty({ example: 6 })
    @Expose()
    @Type(() => Number)
    activePregnancies: number;

    @ApiProperty({ example: 2 })
    @Expose()
    @Type(() => Number)
    birthsLast30Days: number;

    @ApiProperty({ type: [DashboardMonthlyBirthDto] })
    @Expose()
    @Type(() => DashboardMonthlyBirthDto)
    servicesByMonth: DashboardMonthlyBirthDto[] = [];

    @ApiProperty({ type: DashboardDiagnosisResultsDto })
    @Expose()
    @Type(() => DashboardDiagnosisResultsDto)
    diagnosisResults: DashboardDiagnosisResultsDto = new DashboardDiagnosisResultsDto();
}

export class DashboardSelectionBreakdownDto {
    @ApiProperty({ example: 5 })
    @Expose()
    @Type(() => Number)
    replacement: number;

    @ApiProperty({ example: 12 })
    @Expose()
    @Type(() => Number)
    fattening: number;

    @ApiProperty({ example: 3 })
    @Expose()
    @Type(() => Number)
    sale: number;
}

export class DashboardMonthlyWeightDto {
    @ApiProperty({ example: '2026-03' })
    @Expose()
    month: string;

    @ApiProperty({ example: 4 })
    @Expose()
    @Type(() => Number)
    count: number;

    @ApiProperty({ example: 185.4, nullable: true })
    @Expose()
    avgWeight: number | null;
}

export class DashboardRearingDto {
    @ApiProperty({ example: 18 })
    @Expose()
    @Type(() => Number)
    activeCount: number;

    @ApiProperty({ example: 185.4, nullable: true })
    @Expose()
    avgWeight: number | null;

    @ApiProperty({ type: DashboardSelectionBreakdownDto })
    @Expose()
    @Type(() => DashboardSelectionBreakdownDto)
    selectionBreakdown: DashboardSelectionBreakdownDto = new DashboardSelectionBreakdownDto();

    @ApiProperty({ type: [DashboardMonthlyWeightDto] })
    @Expose()
    @Type(() => DashboardMonthlyWeightDto)
    weightTrend: DashboardMonthlyWeightDto[] = [];
}

export class DashboardSystemBreakdownDto {
    @ApiProperty({ example: 9 })
    @Expose()
    @Type(() => Number)
    field: number;

    @ApiProperty({ example: 5 })
    @Expose()
    @Type(() => Number)
    feedlot: number;
}

export class DashboardMonthlyFeedCostDto {
    @ApiProperty({ example: '2026-03' })
    @Expose()
    month: string;

    @ApiProperty({ example: 3200 })
    @Expose()
    @Type(() => Number)
    cost: number;
}

export class DashboardFatteningDto {
    @ApiProperty({ example: 14 })
    @Expose()
    @Type(() => Number)
    activeCount: number;

    @ApiProperty({ example: 320.1, nullable: true })
    @Expose()
    avgWeight: number | null;

    @ApiProperty({ type: DashboardSystemBreakdownDto })
    @Expose()
    @Type(() => DashboardSystemBreakdownDto)
    systemBreakdown: DashboardSystemBreakdownDto = new DashboardSystemBreakdownDto();

    @ApiProperty({ type: [DashboardMonthlyWeightDto] })
    @Expose()
    @Type(() => DashboardMonthlyWeightDto)
    weightTrend: DashboardMonthlyWeightDto[] = [];

    @ApiProperty({ type: [DashboardMonthlyFeedCostDto] })
    @Expose()
    @Type(() => DashboardMonthlyFeedCostDto)
    feedCostByMonth: DashboardMonthlyFeedCostDto[] = [];
}

export class DashboardMonthlyMovementDto {
    @ApiProperty({ example: '2026-03' })
    @Expose()
    month: string;

    @ApiProperty({ example: 3 })
    @Expose()
    @Type(() => Number)
    salesCount: number;

    @ApiProperty({ example: 9500 })
    @Expose()
    @Type(() => Number)
    salesAmount: number;

    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    purchasesCount: number;

    @ApiProperty({ example: 4000 })
    @Expose()
    @Type(() => Number)
    purchasesAmount: number;
}

export class DashboardTrendsDto {
    @ApiProperty({ type: [DashboardMonthlyBirthDto] })
    @Expose()
    @Type(() => DashboardMonthlyBirthDto)
    births: DashboardMonthlyBirthDto[] = [];

    @ApiProperty({ type: [DashboardMonthlyMovementDto] })
    @Expose()
    @Type(() => DashboardMonthlyMovementDto)
    movements: DashboardMonthlyMovementDto[] = [];
}

export class DashboardStatsDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    idRanch: number;

    @ApiProperty({ type: DashboardHerdDto })
    @Expose()
    @Type(() => DashboardHerdDto)
    herd: DashboardHerdDto = new DashboardHerdDto();

    @ApiProperty({ type: DashboardAlertsDto })
    @Expose()
    @Type(() => DashboardAlertsDto)
    alerts: DashboardAlertsDto = new DashboardAlertsDto();

    @ApiProperty({ type: DashboardMovementsDto })
    @Expose()
    @Type(() => DashboardMovementsDto)
    movements: DashboardMovementsDto = new DashboardMovementsDto();

    @ApiProperty({ type: DashboardBreedingDto })
    @Expose()
    @Type(() => DashboardBreedingDto)
    breeding: DashboardBreedingDto = new DashboardBreedingDto();

    @ApiProperty({ type: DashboardRearingDto })
    @Expose()
    @Type(() => DashboardRearingDto)
    rearing: DashboardRearingDto = new DashboardRearingDto();

    @ApiProperty({ type: DashboardFatteningDto })
    @Expose()
    @Type(() => DashboardFatteningDto)
    fattening: DashboardFatteningDto = new DashboardFatteningDto();

    @ApiProperty({ type: DashboardTrendsDto })
    @Expose()
    @Type(() => DashboardTrendsDto)
    trends: DashboardTrendsDto = new DashboardTrendsDto();
}
