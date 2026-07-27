import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionPlansService } from '../services/subscription-plans.service';
import { SubscriptionPlanDto } from '../dto/subscription-plan.dto';
import { Public } from 'src/app/auth/decorators/public.decorator';

@ApiTags('Subscription Plans')
@Controller('subscription-plans')
export class SubscriptionPlansController {
    constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

    @Get()
    @Public()
    @ApiOperation({ summary: 'List active commercial plans (public catalog)' })
    @ApiOkResponse({ type: [SubscriptionPlanDto] })
    async findAllActive(): Promise<{ plans: SubscriptionPlanDto[] }> {
        return { plans: await this.subscriptionPlansService.findAllActive() };
    }
}
