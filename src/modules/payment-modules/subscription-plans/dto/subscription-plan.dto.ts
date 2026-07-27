import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SubscriptionPlanDto {
    @ApiProperty({ example: 2 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ example: 'Estancia' })
    @Expose()
    name: string;

    @ApiProperty({ example: 31 })
    @Expose()
    @Type(() => Number)
    capacityMin: number;

    @ApiProperty({ description: 'null = sin límite (Ganadero Plus)', required: false, nullable: true })
    @Expose()
    @Type(() => Number)
    capacityMax?: number | null;

    @ApiProperty({ example: 100.0 })
    @Expose()
    @Type(() => Number)
    priceMonthly: number;

    @ApiProperty({ example: 1000.0 })
    @Expose()
    @Type(() => Number)
    priceAnnual: number;

    @ApiProperty({ example: 7 })
    @Expose()
    @Type(() => Number)
    trialDays: number;

    @ApiProperty({ example: true })
    @Expose()
    isActive: boolean;
}
