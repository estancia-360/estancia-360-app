import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminUp, UserUp } from 'src/app/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound, ApiValidationError } from 'src/shared/utils/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { ActivatePlanDto } from './dto/inputs/activate-plan.dto';
import { RegisterSubscriptionPaymentDto } from './dto/inputs/register-subscription-payment.dto';
import { RanchSubscriptionDto } from 'src/modules/payment-modules/ranch-subscriptions/dto/ranch-subscription.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@Controller()
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    // ─────────────────────────────────────────────────────────────
    //  ADMIN PANEL
    // ─────────────────────────────────────────────────────────────

    @Get('admin/subscriptions')
    @AdminUp()
    @ApiOperation({ summary: 'List every ranch subscription [ADMIN]' })
    @ApiOkResponse({ type: [RanchSubscriptionDto] })
    async findAll(): Promise<{ subscriptions: RanchSubscriptionDto[] }> {
        return { subscriptions: await this.subscriptionsService.findAll() };
    }

    @Get('admin/subscriptions/metrics')
    @AdminUp()
    @ApiOperation({
        summary: 'Subscription metrics (MRR, active clients) [ADMIN]',
        description: 'MRR = sum of monthly price (or annual price / 12 on an annual cycle) of subscriptions in trial/active status, excluding the Free plan.',
    })
    @ApiOkResponse({ description: 'Metrics computed at query time.' })
    async getMetrics() {
        return await this.subscriptionsService.getMetrics();
    }

    @Get('admin/subscriptions/:idRanch')
    @AdminUp()
    @ApiOperation({ summary: "View a ranch's subscription [ADMIN]" })
    @ApiParam({ name: 'idRanch', example: 1 })
    @ApiOkResponse({ type: RanchSubscriptionDto })
    @ApiNotFound({ code: 'RANCH_SUBSCRIPTION_NOT_FOUND', message: 'Ranch has no subscription registered.' })
    async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number): Promise<{ subscription: RanchSubscriptionDto }> {
        return { subscription: await this.subscriptionsService.findByRanch(idRanch) };
    }

    @Post('admin/subscriptions/:idRanch/activate')
    @AdminUp()
    @ApiOperation({
        summary: "Activate/change a ranch's plan [ADMIN]",
        description: 'Assigns a plan to the ranch. If the plan has trialDays > 0, starts the trial period. Billing itself happens outside the system (QR/transfer) — this only reflects the state already agreed with the client.',
    })
    @ApiParam({ name: 'idRanch', example: 1 })
    @ApiOkResponse({ type: RanchSubscriptionDto })
    @ApiNotFound({ code: 'RANCH_SUBSCRIPTION_NOT_FOUND', message: 'Ranch has no subscription registered.' })
    @ApiValidationError()
    async activatePlan(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Body() dto: ActivatePlanDto,
    ): Promise<{ subscription: RanchSubscriptionDto }> {
        return { subscription: await this.subscriptionsService.activatePlan(idRanch, dto) };
    }

    @Post('admin/subscriptions/:idRanch/payments')
    @AdminUp()
    @ApiOperation({
        summary: 'Register a manual payment and extend the period [ADMIN]',
        description: "Records the proof of a payment received outside the system (QR/transfer) and extends currentPeriodEnd by periodExtendedMonths.",
    })
    @ApiParam({ name: 'idRanch', example: 1 })
    @ApiOkResponse({ type: RanchSubscriptionDto })
    @ApiNotFound({ code: 'RANCH_SUBSCRIPTION_NOT_FOUND', message: 'Ranch has no subscription registered.' })
    @ApiValidationError()
    async registerPayment(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Body() dto: RegisterSubscriptionPaymentDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ subscription: RanchSubscriptionDto }> {
        return { subscription: await this.subscriptionsService.registerPayment(idRanch, dto, idUser) };
    }

    @Patch('admin/subscriptions/:idRanch/cancel')
    @AdminUp()
    @ApiOperation({ summary: "Cancel a ranch's subscription [ADMIN]" })
    @ApiParam({ name: 'idRanch', example: 1 })
    @ApiOkResponse({ type: RanchSubscriptionDto })
    @ApiNotFound({ code: 'RANCH_SUBSCRIPTION_NOT_FOUND', message: 'Ranch has no subscription registered.' })
    async cancel(@Param('idRanch', ParseIntPipe) idRanch: number): Promise<{ subscription: RanchSubscriptionDto }> {
        return { subscription: await this.subscriptionsService.cancel(idRanch) };
    }

    // ─────────────────────────────────────────────────────────────
    //  RANCH-FACING VIEW (authenticated user with access to that ranch)
    // ─────────────────────────────────────────────────────────────

    @Get('subscriptions/my-ranch/:idRanch')
    @UserUp()
    @ApiOperation({
        summary: "View my ranch's subscription status [MOBILE]",
        description: 'The authenticated user must belong to the ranch (any ranch_role). Used by the mobile app to show local capacity/expiration warnings (soft enforcement).',
    })
    @ApiParam({ name: 'idRanch', example: 1 })
    @ApiOkResponse({ type: RanchSubscriptionDto })
    @ApiNotFound({ code: 'RANCH_SUBSCRIPTION_NOT_FOUND', message: 'Ranch has no subscription registered.' })
    async findMyRanchSubscription(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ subscription: RanchSubscriptionDto }> {
        const membership = await this.ranchUsersService.findOne(idUser, idRanch);
        if (!membership) throw new ForbiddenException({ message: 'Permiso denegado', error: 'PERMISSION_DENIED' });

        return { subscription: await this.subscriptionsService.findByRanch(idRanch) };
    }
}
