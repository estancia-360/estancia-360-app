import { MyBadRequestException } from 'src/shared/exceptions';

export class SubscriptionCapacityExceededException extends MyBadRequestException {
    constructor(idRanch: number, capacityMax: number) {
        super(
            `La estancia ID=${idRanch} alcanzó el límite de ${capacityMax} animales de su plan actual. Actualizá el plan para agregar más animales.`,
            'SUBSCRIPTION_CAPACITY_EXCEEDED',
        );
    }
}
