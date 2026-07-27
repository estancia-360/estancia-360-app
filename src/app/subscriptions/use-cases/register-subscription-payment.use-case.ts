import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterSubscriptionPaymentDto } from '../dto/inputs/register-subscription-payment.dto';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';
import { SubscriptionPaymentsService } from 'src/modules/payment-modules/subscription-payments/services/subscription-payments.service';
import { RanchSubscriptionDto } from 'src/modules/payment-modules/ranch-subscriptions/dto/ranch-subscription.dto';
import { PaymentSourceEnum } from 'src/modules/payment-modules/subscription-payments/entities/subscription-payment.entity';

@Injectable()
export class RegisterSubscriptionPaymentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchSubscriptionsService: RanchSubscriptionsService,
        private readonly subscriptionPaymentsService: SubscriptionPaymentsService,
    ) {}

    async execute(idRanch: number, dto: RegisterSubscriptionPaymentDto, registeredBy: number): Promise<RanchSubscriptionDto> {
        if (dto.localId) {
            const existing = await this.subscriptionPaymentsService.findOneByLocalId(dto.localId);
            if (existing) {
                const subscription = await this.ranchSubscriptionsService.findEntityByRanch(idRanch);
                return this.ranchSubscriptionsService.toDto(subscription);
            }
        }

        return await this.dataSource.transaction(async (manager) => {
            const subscriptionBefore = await this.ranchSubscriptionsService.findEntityByRanch(idRanch, manager);

            await this.subscriptionPaymentsService.create(
                {
                    idRanchSubscription: subscriptionBefore.id,
                    amount: dto.amount,
                    paymentDate: new Date(dto.paymentDate),
                    paymentMethod: dto.paymentMethod,
                    paymentSource: PaymentSourceEnum.MANUAL,
                    externalReference: dto.externalReference,
                    periodExtendedMonths: dto.periodExtendedMonths,
                    registeredBy,
                    notes: dto.notes,
                    localId: dto.localId,
                },
                manager,
            );

            const subscription = await this.ranchSubscriptionsService.extendPeriod(idRanch, dto.periodExtendedMonths, manager);
            return this.ranchSubscriptionsService.toDto(subscription);
        });
    }
}
