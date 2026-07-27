import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RanchSubscription } from 'src/modules/payment-modules/ranch-subscriptions/entities/ranch-subscription.entity';
import { User } from 'src/modules/user-management/users/entities/user.entity';

export enum PaymentMethodEnum {
    QR = 'qr',
    TRANSFER = 'transfer',
}

export enum PaymentSourceEnum {
    MANUAL = 'manual',
    GATEWAY = 'gateway',
}

@Entity('subscription_payments')
export class SubscriptionPayment {
    @PrimaryGeneratedColumn({ name: 'id_payment', type: 'bigint' })
    id: number;

    @Column({ name: 'id_ranch_subscription', type: 'bigint' })
    idRanchSubscription: number;

    @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ name: 'payment_date', type: 'date' })
    paymentDate: Date;

    @Column({ name: 'payment_method', type: 'varchar', length: 20 })
    paymentMethod: PaymentMethodEnum;

    @Column({ name: 'payment_source', type: 'varchar', length: 20, default: PaymentSourceEnum.MANUAL })
    paymentSource: PaymentSourceEnum;

    @Column({ name: 'external_reference', type: 'varchar', length: 255, nullable: true })
    externalReference?: string;

    @Column({ name: 'period_extended_months', type: 'int' })
    periodExtendedMonths: number;

    @Column({ name: 'registered_by', type: 'bigint', nullable: true })
    registeredBy?: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => RanchSubscription)
    @JoinColumn({ name: 'id_ranch_subscription' })
    ranchSubscription?: RanchSubscription;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'registered_by' })
    registeredByUser?: User;
}
