import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlansService } from './services/subscription-plans.service';

@Module({
    imports:   [TypeOrmModule.forFeature([SubscriptionPlan])],
    providers: [SubscriptionPlansService],
    exports:   [SubscriptionPlansService],
})
export class SubscriptionPlansModule {}
