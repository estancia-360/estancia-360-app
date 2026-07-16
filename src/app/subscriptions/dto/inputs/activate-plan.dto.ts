import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { BillingCycleEnum } from 'src/modules/payment-modules/ranch-subscriptions/entities/ranch-subscription.entity';

export class ActivatePlanDto {
    @ApiProperty({ description: 'ID del plan a asignar', example: 2 })
    @IsInt()
    @IsPositive()
    idPlan: number;

    @ApiProperty({ description: 'Ciclo de facturación (obligatorio salvo que el plan sea Free)', enum: BillingCycleEnum, required: false })
    @IsOptional()
    @IsEnum(BillingCycleEnum)
    billingCycle?: BillingCycleEnum;
}
