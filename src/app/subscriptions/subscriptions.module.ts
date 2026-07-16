import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { ActivatePlanUseCase } from './use-cases/activate-plan.use-case';
import { RegisterSubscriptionPaymentUseCase } from './use-cases/register-subscription-payment.use-case';
import { CancelSubscriptionUseCase } from './use-cases/cancel-subscription.use-case';
import { RanchSubscriptionsModule } from 'src/modules/payment-modules/ranch-subscriptions/ranch-subscriptions.module';
import { SubscriptionPaymentsModule } from 'src/modules/payment-modules/subscription-payments/subscription-payments.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [
        RanchSubscriptionsModule,
        SubscriptionPaymentsModule,
        RanchUsersModule,
    ],
    controllers: [SubscriptionsController],
    providers: [
        SubscriptionsService,
        ActivatePlanUseCase,
        RegisterSubscriptionPaymentUseCase,
        CancelSubscriptionUseCase,
    ],
})
export class SubscriptionsModule {}
