import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { RanchSubscription } from '../../ranch-subscriptions/entities/ranch-subscription.entity';
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

    @Column({ name: 'id_ranch_subscription', type: 'bigint', nullable: false })
    idRanchSubscription: number;

    @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
    amount: number;

    @Column({ name: 'payment_date', type: 'date', nullable: false })
    paymentDate: Date;

    @Column({ name: 'payment_method', type: 'varchar', length: 20, nullable: false })
    paymentMethod: PaymentMethodEnum;

    @Column({ name: 'payment_source', type: 'varchar', length: 20, nullable: false, default: PaymentSourceEnum.MANUAL })
    paymentSource: PaymentSourceEnum;

    @Column({ name: 'external_reference', type: 'varchar', length: 255, nullable: true })
    externalReference?: string;

    @Column({ name: 'period_extended_months', type: 'int', nullable: false })
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
