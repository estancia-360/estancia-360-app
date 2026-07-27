import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SubscriptionPlanDto } from 'src/modules/payment-modules/subscription-plans/dto/subscription-plan.dto';
import { BillingCycleEnum } from '../entities/ranch-subscription.entity';
import { SubscriptionRanchDto } from './subscription-ranch.dto';

export type SubscriptionEffectiveStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export class RanchSubscriptionDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    idRanch: number;

    @ApiProperty({ type: SubscriptionRanchDto })
    @Expose()
    @Type(() => SubscriptionRanchDto)
    ranch: SubscriptionRanchDto = new SubscriptionRanchDto();

    @ApiProperty({ example: 2 })
    @Expose()
    @Type(() => Number)
    idPlan: number;

    @ApiProperty({ enum: BillingCycleEnum, required: false, nullable: true })
    @Expose()
    billingCycle?: BillingCycleEnum | null;

    @ApiProperty({ required: false, nullable: true })
    @Expose()
    trialEndsAt?: Date | null;

    @ApiProperty({ required: false, nullable: true })
    @Expose()
    currentPeriodEnd?: Date | null;

    @ApiProperty({ required: false, nullable: true })
    @Expose()
    cancelledAt?: Date | null;

    @ApiProperty({ enum: ['trial', 'active', 'expired', 'cancelled'] })
    @Expose()
    effectiveStatus: SubscriptionEffectiveStatus;

    @ApiProperty({ type: SubscriptionPlanDto })
    @Expose()
    @Type(() => SubscriptionPlanDto)
    plan: SubscriptionPlanDto = new SubscriptionPlanDto();

    @ApiProperty()
    @Expose()
    createdAt: Date;
}
