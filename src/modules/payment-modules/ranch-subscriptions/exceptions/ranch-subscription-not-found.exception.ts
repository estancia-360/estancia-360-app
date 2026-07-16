import { MyNotFoundException } from 'src/shared/exceptions';

export class RanchSubscriptionNotFoundException extends MyNotFoundException {
    constructor(idRanch: number) {
        super(`La estancia ID=${idRanch} no tiene una suscripción registrada.`, 'RANCH_SUBSCRIPTION_NOT_FOUND');
    }
}
