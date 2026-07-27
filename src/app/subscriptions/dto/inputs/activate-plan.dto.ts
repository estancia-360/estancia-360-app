import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { BillingCycleEnum } from 'src/modules/payment-modules/ranch-subscriptions/entities/ranch-subscription.entity';

export class ActivatePlanDto {
    @ApiProperty({ description: 'ID of the plan to assign', example: 2 })
    @IsInt()
    @IsPositive()
    idPlan: number;

    @ApiProperty({ description: 'Billing cycle (required unless the plan is Free)', enum: BillingCycleEnum, required: false })
    @IsOptional()
    @IsEnum(BillingCycleEnum)
    billingCycle?: BillingCycleEnum;
}
