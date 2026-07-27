import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { RanchSubscription, BillingCycleEnum } from '../entities/ranch-subscription.entity';
import { RanchSubscriptionDto, SubscriptionEffectiveStatus } from '../dto/ranch-subscription.dto';
import { SubscriptionPlansService } from 'src/modules/payment-modules/subscription-plans/services/subscription-plans.service';
import { RanchSubscriptionNotFoundException, SubscriptionCapacityExceededException } from '../exceptions';

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
        const subscription = await repo.findOne({ where: { idRanch }, relations: { plan: true, ranch: true } });
        if (!subscription) throw new RanchSubscriptionNotFoundException(idRanch);
        return subscription;
    }

    async findEntityById(id: number, manager?: EntityManager): Promise<RanchSubscription | null> {
        const repo = manager?.getRepository(RanchSubscription) ?? this.rawRepo;
        return await repo.findOne({ where: { id }, relations: { plan: true, ranch: true } });
    }

    toDto(subscription: RanchSubscription): RanchSubscriptionDto {
        const dto = plainToInstance(RanchSubscriptionDto, subscription, { excludeExtraneousValues: true });
        dto.effectiveStatus = this.getEffectiveStatus(subscription);
        return dto;
    }

    async activatePlan(
        idRanch: number,
        data: { idPlan: number; billingCycle?: BillingCycleEnum },
        manager?: EntityManager,
    ): Promise<RanchSubscription> {
        const em = manager ?? this.rawRepo.manager;
        const subscription = await this.findEntityByRanch(idRanch, manager);
        const plan = await this.subscriptionPlansService.findEntityById(data.idPlan, manager);

        // billingCycle determina cómo se calcula el MRR (priceMonthly vs
        // priceAnnual/12) — dejarlo en null silenciosamente en un plan pago haría que
        // getMetrics() asuma mensual sin avisar. Obligatorio salvo Free.
        if (Number(plan.priceMonthly) > 0 && !data.billingCycle) {
            throw new BadRequestException({
                message: `El plan "${plan.name}" requiere especificar billingCycle (monthly o annual).`,
                error: 'BILLING_CYCLE_REQUIRED',
            });
        }

        let trialEndsAt: Date | null = null;
        if (plan.trialDays > 0) {
            const now = new Date();
            // TypeORM lee columnas DATE parseándolas como medianoche UTC, pero al
            // persistir usa getters LOCALES (getFullYear/getMonth/getDate) — hay que
            // construir con el constructor local alimentado por los componentes UTC,
            // si no el día persistido queda corrido según el timezone del server.
            trialEndsAt = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + plan.trialDays);
        }

        // save() no sirve acá: si se le asigna `undefined` a un campo nullable y se
        // guarda un entity con la relación `plan` ya cargada, TypeORM omite esas
        // columnas del UPDATE en vez de mandar NULL — por eso se arma el UPDATE
        // explícito acá.
        await em
            .createQueryBuilder()
            .update(RanchSubscription)
            .set({
                idPlan: plan.id,
                billingCycle: data.billingCycle ?? (() => 'NULL'),
                cancelledAt: () => 'NULL',
                trialEndsAt: trialEndsAt ?? (() => 'NULL'),
                updatedAt: new Date(),
            } as any)
            .where({ id: subscription.id })
            .execute();

        return await this.findEntityByRanch(idRanch, manager);
    }

    async extendPeriod(idRanch: number, months: number, manager?: EntityManager): Promise<RanchSubscription> {
        const em = manager ?? this.rawRepo.manager;
        const subscription = await this.findEntityByRanch(idRanch, manager);

        const now = new Date();
        const baseSource =
            subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > now
                ? new Date(subscription.currentPeriodEnd)
                : now;
        // Mismo cuidado de timezone que en activatePlan(): reconstruir con
        // componentes UTC y constructor local.
        const base = new Date(baseSource.getUTCFullYear(), baseSource.getUTCMonth() + months, baseSource.getUTCDate());

        await em
            .createQueryBuilder()
            .update(RanchSubscription)
            .set({
                currentPeriodEnd: base,
                trialEndsAt: () => 'NULL',
                updatedAt: new Date(),
            } as any)
            .where({ id: subscription.id })
            .execute();

        return await this.findEntityByRanch(idRanch, manager);
    }

    async cancel(idRanch: number, manager?: EntityManager): Promise<RanchSubscription> {
        const repo = manager?.getRepository(RanchSubscription) ?? this.rawRepo;
        const subscription = await this.findEntityByRanch(idRanch, manager);
        subscription.cancelledAt = new Date();
        subscription.updatedAt = new Date();
        return await repo.save(subscription);
    }

    async findAllWithPlan(manager?: EntityManager): Promise<RanchSubscription[]> {
        const repo = manager?.getRepository(RanchSubscription) ?? this.rawRepo;
        return await repo.find({ relations: { plan: true, ranch: true } });
    }

    async getMetrics(manager?: EntityManager): Promise<{
        activeClients: number;
        mrr: number;
        byPlan: Array<{ idPlan: number; name: string; count: number }>;
    }> {
        const freePlan = await this.subscriptionPlansService.findFreePlan(manager);
        const subscriptions = await this.findAllWithPlan(manager);

        let mrr = 0;
        let activeClients = 0;
        const byPlanMap = new Map<number, { idPlan: number; name: string; count: number }>();

        for (const subscription of subscriptions) {
            if (subscription.idPlan === freePlan.id) continue;

            // Solo 'active' cuenta como MRR/cliente activo — un trial todavía no pagó
            // nada, y el MRR alimenta decisiones reales.
            const status = this.getEffectiveStatus(subscription);
            if (status !== 'active') continue;

            const plan = subscription.plan!;
            activeClients += 1;
            mrr += subscription.billingCycle === BillingCycleEnum.ANNUAL ? Number(plan.priceAnnual) / 12 : Number(plan.priceMonthly);

            const entry = byPlanMap.get(plan.id) ?? { idPlan: plan.id, name: plan.name, count: 0 };
            entry.count += 1;
            byPlanMap.set(plan.id, entry);
        }

        return {
            activeClients,
            mrr: Math.round(mrr * 100) / 100,
            byPlan: Array.from(byPlanMap.values()),
        };
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
