import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RanchSubscription } from '../entities/ranch-subscription.entity';
import { SubscriptionPlansService } from 'src/modules/payment-modules/subscription-plans/services/subscription-plans.service';
import { RanchSubscriptionNotFoundException, SubscriptionCapacityExceededException } from '../exceptions';

export type SubscriptionEffectiveStatus = 'trial' | 'active' | 'expired' | 'cancelled';

@Injectable()
export class RanchSubscriptionsService {
    constructor(
        @InjectRepository(RanchSubscription)
        private readonly rawRepo: Repository<RanchSubscription>,
        private readonly subscriptionPlansService: SubscriptionPlansService,
    ) {}

    async createFreeSubscription(idRanch: number, manager?: EntityManager): Promise<RanchSubscription> {
        const repo = manager?.getRepository(RanchSubscription) ?? this.rawRepo;

        const existing = await repo.findOne({ where: { idRanch } });
        if (existing) return existing;

        const freePlan = await this.subscriptionPlansService.findFreePlan(manager);

        const subscription = repo.create();
        subscription.idRanch = idRanch;
        subscription.idPlan = freePlan.id;

        return await repo.save(subscription);
    }

    async findEntityByRanch(idRanch: number, manager?: EntityManager): Promise<RanchSubscription> {
        const repo = manager?.getRepository(RanchSubscription) ?? this.rawRepo;
        const subscription = await repo.findOne({ where: { idRanch }, relations: { plan: true } });
        if (!subscription) throw new RanchSubscriptionNotFoundException(idRanch);
        return subscription;
    }

    getEffectiveStatus(subscription: RanchSubscription): SubscriptionEffectiveStatus {
        if (subscription.cancelledAt) return 'cancelled';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (subscription.trialEndsAt && today < new Date(subscription.trialEndsAt)) return 'trial';
        if (subscription.currentPeriodEnd && today <= new Date(subscription.currentPeriodEnd)) return 'active';
        if (!subscription.trialEndsAt && !subscription.currentPeriodEnd) return 'active';
        return 'expired';
    }

    async getEffectiveCapacity(idRanch: number, manager?: EntityManager): Promise<number | null> {
        const subscription = await this.findEntityByRanch(idRanch, manager);
        const status = this.getEffectiveStatus(subscription);
        if (status === 'expired' || status === 'cancelled') {
            const freePlan = await this.subscriptionPlansService.findFreePlan(manager);
            return freePlan.capacityMax ?? null;
        }
        const plan = subscription.plan ?? (await this.subscriptionPlansService.findEntityById(subscription.idPlan, manager));
        return plan.capacityMax ?? null;
    }

    async assertCapacityAvailable(
        idRanch: number,
        currentActiveCount: number,
        additionalCount: number,
        manager?: EntityManager,
    ): Promise<void> {
        const capacityMax = await this.getEffectiveCapacity(idRanch, manager);
        if (capacityMax === null) return;
        if (currentActiveCount + additionalCount > capacityMax) {
            throw new SubscriptionCapacityExceededException(idRanch, capacityMax);
        }
    }
}
