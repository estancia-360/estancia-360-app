import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_plan' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 30 })
    name: string;

    @Column({ name: 'capacity_min', type: 'int' })
    capacityMin: number;

    @Column({ name: 'capacity_max', type: 'int', nullable: true })
    capacityMax: number | null;

    @Column({ name: 'price_monthly', type: 'decimal', precision: 8, scale: 2 })
    priceMonthly: number;

    @Column({ name: 'price_annual', type: 'decimal', precision: 8, scale: 2 })
    priceAnnual: number;

    @Column({ name: 'trial_days', type: 'int', default: 0 })
    trialDays: number;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;
}
