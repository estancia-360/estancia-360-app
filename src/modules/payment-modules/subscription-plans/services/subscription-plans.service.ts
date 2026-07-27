import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
    constructor(
        @InjectRepository(SubscriptionPlan)
        private readonly rawRepo: Repository<SubscriptionPlan>,
    ) {}

    async findFreePlan(manager?: EntityManager): Promise<SubscriptionPlan> {
        const repo = manager?.getRepository(SubscriptionPlan) ?? this.rawRepo;
        const plan = await repo.findOne({ where: { name: 'Free' } });
        if (!plan) throw new NotFoundException({ message: 'El plan Free no está configurado.', error: 'FREE_PLAN_NOT_FOUND' });
        return plan;
    }

    async findEntityById(id: number, manager?: EntityManager): Promise<SubscriptionPlan> {
        const repo = manager?.getRepository(SubscriptionPlan) ?? this.rawRepo;
        const plan = await repo.findOne({ where: { id } });
        if (!plan) throw new NotFoundException({ message: `El plan ID=${id} no fue encontrado.`, error: 'SUBSCRIPTION_PLAN_NOT_FOUND' });
        return plan;
    }
}
