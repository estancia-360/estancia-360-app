import { BadRequestException } from '@nestjs/common';

export class SubscriptionCapacityExceededException extends BadRequestException {
    constructor(idRanch: number, capacityMax: number) {
        super({
            message: `Ranch ID=${idRanch} reached the ${capacityMax}-animal limit of its current plan. Upgrade the plan to add more animals.`,
            error: 'SUBSCRIPTION_CAPACITY_EXCEEDED',
        });
    }
}
