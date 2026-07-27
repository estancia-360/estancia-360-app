import { Injectable } from '@nestjs/common';
import { ActivatePlanDto } from './dto/inputs/activate-plan.dto';
import { RegisterSubscriptionPaymentDto } from './dto/inputs/register-subscription-payment.dto';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';
import { RanchSubscriptionDto } from 'src/modules/payment-modules/ranch-subscriptions/dto/ranch-subscription.dto';
import { ActivatePlanUseCase } from './use-cases/activate-plan.use-case';
import { RegisterSubscriptionPaymentUseCase } from './use-cases/register-subscription-payment.use-case';
import { CancelSubscriptionUseCase } from './use-cases/cancel-subscription.use-case';

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly ranchSubscriptionsService: RanchSubscriptionsService,
        private readonly activatePlanUseCase: ActivatePlanUseCase,
        private readonly registerSubscriptionPaymentUseCase: RegisterSubscriptionPaymentUseCase,
        private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    ) {}

    async findAll(): Promise<RanchSubscriptionDto[]> {
        const subscriptions = await this.ranchSubscriptionsService.findAllWithPlan();
        return subscriptions.map((subscription) => this.ranchSubscriptionsService.toDto(subscription));
    }

    getMetrics() {
        return this.ranchSubscriptionsService.getMetrics();
    }

    async findByRanch(idRanch: number): Promise<RanchSubscriptionDto> {
        const subscription = await this.ranchSubscriptionsService.findEntityByRanch(idRanch);
        return this.ranchSubscriptionsService.toDto(subscription);
    }

    activatePlan(idRanch: number, dto: ActivatePlanDto): Promise<RanchSubscriptionDto> {
        return this.activatePlanUseCase.execute(idRanch, dto);
    }

    registerPayment(idRanch: number, dto: RegisterSubscriptionPaymentDto, registeredBy: number): Promise<RanchSubscriptionDto> {
        return this.registerSubscriptionPaymentUseCase.execute(idRanch, dto, registeredBy);
    }

    cancel(idRanch: number): Promise<RanchSubscriptionDto> {
        return this.cancelSubscriptionUseCase.execute(idRanch);
    }
}
