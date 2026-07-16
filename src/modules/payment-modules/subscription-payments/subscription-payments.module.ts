import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { SubscriptionPaymentsService } from './services/subscription-payments.service';

@Module({
    imports: [TypeOrmModule.forFeature([SubscriptionPayment])],
    providers: [SubscriptionPaymentsService],
    exports: [SubscriptionPaymentsService],
})
export class SubscriptionPaymentsModule {}
