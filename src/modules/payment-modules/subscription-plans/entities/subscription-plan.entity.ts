import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_plan', type: 'int' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 30, nullable: false })
    name: string;

    @Column({ name: 'capacity_min', type: 'int', nullable: false })
    capacityMin: number;

    @Column({ name: 'capacity_max', type: 'int', nullable: true })
    capacityMax?: number;

    @Column({ name: 'price_monthly', type: 'decimal', precision: 8, scale: 2, nullable: false })
    priceMonthly: number;

    @Column({ name: 'price_annual', type: 'decimal', precision: 8, scale: 2, nullable: false })
    priceAnnual: number;

    @Column({ name: 'trial_days', type: 'int', nullable: false, default: 0 })
    trialDays: number;

    @Column({ name: 'is_active', type: 'boolean', nullable: false, default: true })
    isActive: boolean;
}
