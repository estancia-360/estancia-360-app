import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { SubscriptionPlanDto } from '../dto/subscription-plan.dto';
import { MyNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class SubscriptionPlansService {
    constructor(
        @InjectRepository(SubscriptionPlan)
        private readonly subscriptionPlansRepository: Repository<SubscriptionPlan>,
    ) {}

    async findAllActive(): Promise<SubscriptionPlanDto[]> {
        const plans = await this.subscriptionPlansRepository.find({
            where: { isActive: true },
            order: { capacityMin: 'ASC' },
        });
        return plainToInstance(SubscriptionPlanDto, plans, { excludeExtraneousValues: true });
    }

    async findEntityById(id: number, manager?: EntityManager): Promise<SubscriptionPlan> {
        const repo = manager?.getRepository(SubscriptionPlan) ?? this.subscriptionPlansRepository;
        const plan = await repo.findOne({ where: { id } });
        if (!plan) {
            throw new MyNotFoundException(`El plan con ID = ${id} no fue encontrado.`, 'SUBSCRIPTION_PLAN_NOT_FOUND');
        }
        return plan;
    }

    async findFreePlan(manager?: EntityManager): Promise<SubscriptionPlan> {
        const repo = manager?.getRepository(SubscriptionPlan) ?? this.subscriptionPlansRepository;
        const plan = await repo.findOne({ where: { name: 'Free' } });
        if (!plan) {
            throw new MyNotFoundException('El plan Free no está configurado.', 'FREE_PLAN_NOT_FOUND');
        }
        return plan;
    }
}
