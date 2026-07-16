import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { SubscriptionPlansService } from '../services/subscription-plans.service';
import { SubscriptionPlanDto } from '../dto/subscription-plan.dto';

@ApiTags('Suscripciones — Planes')
@Controller('subscription-plans')
export class SubscriptionPlansController {
    constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

    @Get()
    @ApiOperation({ summary: 'Listar los planes comerciales disponibles' })
    @ApiOkResponse({ type: [SubscriptionPlanDto] })
    async findAll(@Res() res: express.Response) {
        const plans = await this.subscriptionPlansService.findAllActive();
        return OkRes(res, { plans });
    }
}
