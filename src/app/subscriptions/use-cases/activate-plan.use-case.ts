import { Injectable } from '@nestjs/common';
import { ActivatePlanDto } from '../dto/inputs/activate-plan.dto';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';
import { RanchSubscriptionDto } from 'src/modules/payment-modules/ranch-subscriptions/dto/ranch-subscription.dto';

@Injectable()
export class ActivatePlanUseCase {
    constructor(private readonly ranchSubscriptionsService: RanchSubscriptionsService) {}

    async execute(idRanch: number, dto: ActivatePlanDto): Promise<RanchSubscriptionDto> {
        await this.ranchSubscriptionsService.activatePlan(idRanch, {
            idPlan: dto.idPlan,
            billingCycle: dto.billingCycle,
        });
        const subscription = await this.ranchSubscriptionsService.findEntityByRanch(idRanch);
        return this.ranchSubscriptionsService.toDto(subscription);
    }
}
