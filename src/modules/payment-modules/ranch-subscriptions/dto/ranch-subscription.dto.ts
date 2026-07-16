import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SubscriptionPlanDto } from 'src/modules/payment-modules/subscription-plans/dto/subscription-plan.dto';
import { BillingCycleEnum } from '../entities/ranch-subscription.entity';
import { SubscriptionRanchDto } from './subscription-ranch.dto';

export type SubscriptionEffectiveStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export class RanchSubscriptionDto {
    @ApiProperty({ description: 'ID de la suscripción', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @Expose()
    @Type(() => Number)
    idRanch: number;

    @ApiProperty({ description: 'Estancia a la que pertenece esta suscripción', type: SubscriptionRanchDto })
    @Expose()
    @Type(() => SubscriptionRanchDto)
    ranch: SubscriptionRanchDto = new SubscriptionRanchDto();

    @ApiProperty({ description: 'ID del plan actual', example: 2 })
    @Expose()
    @Type(() => Number)
    idPlan: number;

    @ApiProperty({ description: 'Ciclo de facturación', enum: BillingCycleEnum, required: false, nullable: true })
    @Expose()
    billingCycle?: BillingCycleEnum;

    @ApiProperty({ description: 'Fin del período de prueba', required: false, nullable: true })
    @Expose()
    trialEndsAt?: Date;

    @ApiProperty({ description: 'Fecha hasta la que está pago el plan actual', required: false, nullable: true })
    @Expose()
    currentPeriodEnd?: Date;

    @ApiProperty({ description: 'Fecha de cancelación manual', required: false, nullable: true })
    @Expose()
    cancelledAt?: Date;

    @ApiProperty({ description: 'Estado efectivo calculado por fecha', enum: ['trial', 'active', 'expired', 'cancelled'] })
    @Expose()
    effectiveStatus: SubscriptionEffectiveStatus;

    @ApiProperty({ description: 'Plan actual', type: SubscriptionPlanDto })
    @Expose()
    @Type(() => SubscriptionPlanDto)
    plan: SubscriptionPlanDto = new SubscriptionPlanDto();

    @ApiProperty({ description: 'Fecha de creación' })
    @Expose()
    createdAt: Date;
}
