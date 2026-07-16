import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchSubscription } from './entities/ranch-subscription.entity';
import { RanchSubscriptionsService } from './services/ranch-subscriptions.service';
import { SubscriptionPlansModule } from 'src/modules/payment-modules/subscription-plans/subscription-plans.module';

@Module({
    imports: [TypeOrmModule.forFeature([RanchSubscription]), SubscriptionPlansModule],
    providers: [RanchSubscriptionsService],
    exports: [RanchSubscriptionsService],
})
export class RanchSubscriptionsModule {}
