import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { SubscriptionPlan } from 'src/modules/payment-modules/subscription-plans/entities/subscription-plan.entity';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';

export enum BillingCycleEnum {
    MONTHLY = 'monthly',
    ANNUAL = 'annual',
}

@Entity('ranch_subscriptions')
export class RanchSubscription extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_ranch_subscription' })
    id: number;

    @Column({ name: 'id_ranch', type: 'int', unique: true })
    idRanch: number;

    @Column({ name: 'id_plan', type: 'int' })
    idPlan: number;

    @Column({ name: 'billing_cycle', type: 'varchar', length: 10, nullable: true })
    billingCycle: BillingCycleEnum | null;

    @Column({ name: 'trial_ends_at', type: 'date', nullable: true })
    trialEndsAt: Date | null;

    @Column({ name: 'current_period_end', type: 'date', nullable: true })
    currentPeriodEnd: Date | null;

    @Column({ name: 'cancelled_at', type: 'date', nullable: true })
    cancelledAt: Date | null;

    @ManyToOne(() => Ranch)
    @JoinColumn({ name: 'id_ranch' })
    ranch: Ranch;

    @ManyToOne(() => SubscriptionPlan)
    @JoinColumn({ name: 'id_plan' })
    plan: SubscriptionPlan;
}
