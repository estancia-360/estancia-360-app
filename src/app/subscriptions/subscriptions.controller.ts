import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { AuthRolesGuard } from 'src/app/auth/guards/auth-roles.guard';
import { PermissionDeniedException } from 'src/app/auth/exceptions/permission-denied.exception';
import { RoleEnum } from 'src/shared/enums';
import { SubscriptionsService } from './subscriptions.service';
import { ActivatePlanDto } from './dto/inputs/activate-plan.dto';
import { RegisterSubscriptionPaymentDto } from './dto/inputs/register-subscription-payment.dto';
import { RanchSubscriptionDto } from 'src/modules/payment-modules/ranch-subscriptions/dto/ranch-subscription.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Suscripciones')
@Controller()
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    // ─────────────────────────────────────────────────────────────
    //  PANEL ADMIN (RoleEnum.ADMIN)
    // ─────────────────────────────────────────────────────────────

    @Get('admin/subscriptions')
    @UseGuards(AuthRolesGuard([RoleEnum.ADMIN]))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todas las suscripciones de estancias [ADMIN]' })
    @ApiOkResponse({ description: 'Listado de suscripciones', type: [RanchSubscriptionDto] })
    async findAll(@Res() res: express.Response) {
        const result = await this.subscriptionsService.findAll();
        return OkRes(res, { subscriptions: result });
    }

    @Get('admin/subscriptions/metrics')
    @UseGuards(AuthRolesGuard([RoleEnum.ADMIN]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Métricas de suscripciones (MRR, clientes activos) [ADMIN]',
        description: 'MRR = suma de precio mensual (o precio anual/12 en ciclo anual) de las suscripciones en estado trial/active, excluyendo el plan Free. `activeClients` sigue la misma definición usada en `finanzas-flujo-caja.md`.',
    })
    @ApiOkResponse({ description: 'Métricas calculadas al momento de la consulta' })
    async getMetrics(@Res() res: express.Response) {
        const result = await this.subscriptionsService.getMetrics();
        return OkRes(res, result);
    }

    @Get('admin/subscriptions/:idRanch')
    @UseGuards(AuthRolesGuard([RoleEnum.ADMIN]))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ver la suscripción de una estancia [ADMIN]' })
    @ApiParam({ name: 'idRanch', description: 'ID de la estancia', example: 1 })
    @ApiOkResponse({ description: 'Suscripción de la estancia', type: RanchSubscriptionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number, @Res() res: express.Response) {
        const result = await this.subscriptionsService.findByRanch(idRanch);
        return OkRes(res, { subscription: result });
    }

    @Post('admin/subscriptions/:idRanch/activate')
    @UseGuards(AuthRolesGuard([RoleEnum.ADMIN]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Activar/cambiar el plan de una estancia [ADMIN]',
        description: 'Asigna un plan a la estancia. Si el plan tiene `trialDays > 0`, inicia el período de prueba. El cobro se gestiona por fuera del sistema (QR/transferencia) — esto solo refleja el estado ya acordado con el cliente.',
    })
    @ApiParam({ name: 'idRanch', description: 'ID de la estancia', example: 1 })
    @ApiOkResponse({ description: 'Plan activado', type: RanchSubscriptionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async activatePlan(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Body() dto: ActivatePlanDto,
        @Res() res: express.Response,
    ) {
        const result = await this.subscriptionsService.activatePlan(idRanch, dto);
        return OkRes(res, { subscription: result });
    }

    @Post('admin/subscriptions/:idRanch/payments')
    @UseGuards(AuthRolesGuard([RoleEnum.ADMIN]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Registrar un pago manual y extender el período [ADMIN]',
        description: 'Registra el comprobante de un pago recibido por fuera del sistema (QR/transferencia) y extiende `currentPeriodEnd` según `periodExtendedMonths`.',
    })
    @ApiParam({ name: 'idRanch', description: 'ID de la estancia', example: 1 })
    @ApiOkResponse({ description: 'Pago registrado y período extendido', type: RanchSubscriptionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async registerPayment(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Body() dto: RegisterSubscriptionPaymentDto,
        @Req() req: express.Request,
        @Res() res: express.Response,
    ) {
        const registeredBy = (req.user as any).id;
        const result = await this.subscriptionsService.registerPayment(idRanch, dto, registeredBy);
        return OkRes(res, { subscription: result });
    }

    @Patch('admin/subscriptions/:idRanch/cancel')
    @UseGuards(AuthRolesGuard([RoleEnum.ADMIN]))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancelar la suscripción de una estancia [ADMIN]' })
    @ApiParam({ name: 'idRanch', description: 'ID de la estancia', example: 1 })
    @ApiOkResponse({ description: 'Suscripción cancelada', type: RanchSubscriptionDto })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async cancel(@Param('idRanch', ParseIntPipe) idRanch: number, @Res() res: express.Response) {
        const result = await this.subscriptionsService.cancel(idRanch);
        return OkRes(res, { subscription: result });
    }

    // ─────────────────────────────────────────────────────────────
    //  VISTA ESTANCIA (usuario autenticado, con acceso a esa estancia)
    // ─────────────────────────────────────────────────────────────

    @Get('subscriptions/my-ranch/:idRanch')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Ver el estado de suscripción de mi estancia [REACT NATIVE]',
        description: 'El usuario autenticado debe pertenecer a la estancia (cualquier `ranch_role`). Usado por la app móvil para mostrar advertencias locales de capacidad/vencimiento (enforcement soft).',
    })
    @ApiParam({ name: 'idRanch', description: 'ID de la estancia', example: 1 })
    @ApiOkResponse({ description: 'Suscripción de la estancia', type: RanchSubscriptionDto })
    @ApiForbiddenResponse({ description: 'El usuario no pertenece a esta estancia' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findMyRanchSubscription(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Req() req: express.Request,
        @Res() res: express.Response,
    ) {
        const idUser = (req.user as any).id;
        const membership = await this.ranchUsersService.findOne(idUser, idRanch);
        if (!membership) throw new PermissionDeniedException();

        const result = await this.subscriptionsService.findByRanch(idRanch);
        return OkRes(res, { subscription: result });
    }
}
