import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SubscriptionPayment, PaymentMethodEnum, PaymentSourceEnum } from '../entities/subscription-payment.entity';
import { SubscriptionPaymentDto } from '../dto/subscription-payment.dto';

@Injectable()
export class SubscriptionPaymentsService {
    constructor(
        @InjectRepository(SubscriptionPayment)
        private readonly subscriptionPaymentsRepository: Repository<SubscriptionPayment>,
    ) {}

    async create(data: {
        idRanchSubscription: number;
        amount: number;
        paymentDate: Date;
        paymentMethod: PaymentMethodEnum;
        paymentSource?: PaymentSourceEnum;
        externalReference?: string;
        periodExtendedMonths: number;
        registeredBy?: number;
        notes?: string;
        localId?: string;
    }, manager?: EntityManager): Promise<SubscriptionPayment> {
        const repo = manager?.getRepository(SubscriptionPayment) ?? this.subscriptionPaymentsRepository;
        const payment = new SubscriptionPayment();
        payment.idRanchSubscription = data.idRanchSubscription;
        payment.amount = data.amount;
        payment.paymentDate = data.paymentDate;
        payment.paymentMethod = data.paymentMethod;
        payment.paymentSource = data.paymentSource ?? PaymentSourceEnum.MANUAL;
        payment.externalReference = data.externalReference;
        payment.periodExtendedMonths = data.periodExtendedMonths;
        payment.registeredBy = data.registeredBy;
        payment.notes = data.notes;
        payment.localId = data.localId;
        return await repo.save(payment);
    }

    async findOneByLocalId(localId: string, manager?: EntityManager): Promise<SubscriptionPayment | null> {
        const repo = manager?.getRepository(SubscriptionPayment) ?? this.subscriptionPaymentsRepository;
        return await repo.findOne({ where: { localId } });
    }

    async findByRanchSubscription(idRanchSubscription: number, manager?: EntityManager): Promise<SubscriptionPaymentDto[]> {
        const repo = manager?.getRepository(SubscriptionPayment) ?? this.subscriptionPaymentsRepository;
        const payments = await repo.find({
            where: { idRanchSubscription },
            order: { paymentDate: 'DESC' },
        });
        return plainToInstance(SubscriptionPaymentDto, payments, { excludeExtraneousValues: true });
    }
}
