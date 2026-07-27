import { Injectable } from '@nestjs/common';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';
import { RanchSubscriptionDto } from 'src/modules/payment-modules/ranch-subscriptions/dto/ranch-subscription.dto';

@Injectable()
export class CancelSubscriptionUseCase {
    constructor(private readonly ranchSubscriptionsService: RanchSubscriptionsService) {}

    async execute(idRanch: number): Promise<RanchSubscriptionDto> {
        const subscription = await this.ranchSubscriptionsService.cancel(idRanch);
        return this.ranchSubscriptionsService.toDto(subscription);
    }
}
