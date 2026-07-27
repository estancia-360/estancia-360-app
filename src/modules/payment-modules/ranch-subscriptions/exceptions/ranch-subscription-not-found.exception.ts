import { NotFoundException } from '@nestjs/common';

export class RanchSubscriptionNotFoundException extends NotFoundException {
    constructor(idRanch: number) {
        super({ message: `Ranch ID=${idRanch} has no subscription registered.`, error: 'RANCH_SUBSCRIPTION_NOT_FOUND' });
    }
}
