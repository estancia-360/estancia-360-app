import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SubscriptionPlan } from '../../subscription-plans/entities/subscription-plan.entity';

export enum BillingCycleEnum {
    MONTHLY = 'monthly',
    ANNUAL = 'annual',
}

@Entity('ranch_subscriptions')
export class RanchSubscription extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_ranch_subscription', type: 'bigint' })
    id: number;

    @Column({ name: 'id_ranch', type: 'bigint', nullable: false, unique: true })
    idRanch: number;

    @Column({ name: 'id_plan', type: 'int', nullable: false })
    idPlan: number;

    @Column({ name: 'billing_cycle', type: 'varchar', length: 10, nullable: true })
    billingCycle?: BillingCycleEnum;

    @Column({ name: 'trial_ends_at', type: 'date', nullable: true })
    trialEndsAt?: Date;

    @Column({ name: 'current_period_end', type: 'date', nullable: true })
    currentPeriodEnd?: Date;

    @Column({ name: 'cancelled_at', type: 'date', nullable: true })
    cancelledAt?: Date;

    @ManyToOne(() => Ranch)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => SubscriptionPlan)
    @JoinColumn({ name: 'id_plan' })
    plan?: SubscriptionPlan;
}
