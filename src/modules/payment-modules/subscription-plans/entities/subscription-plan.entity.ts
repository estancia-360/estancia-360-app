import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Slice mínimo del módulo de Pagos — solo lo que necesita
 * RanchSubscriptionsService.createFreeSubscription() al crear una estancia.
 * El resto del módulo (planes de pago, panel admin, historial de pagos) es
 * una migración aparte, todavía no hecha acá.
 */
@Entity('subscription_plans')
export class SubscriptionPlan {
    @PrimaryGeneratedColumn({ name: 'id_plan' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 50 })
    name: string;

    @Column({ name: 'capacity_min', type: 'int' })
    capacityMin: number;

    @Column({ name: 'capacity_max', type: 'int', nullable: true })
    capacityMax: number | null;
}
