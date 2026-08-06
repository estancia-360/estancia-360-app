import { Controller, ForbiddenException, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { GetDashboardStatsUseCase } from './use-cases/get-dashboard-stats.use-case';
import { DashboardStatsDto } from './dto/outputs/dashboard-stats.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get(':idRanch')
    @UserUp()
    @ApiOperation({
        summary: "Aggregated stats for the ranch's web dashboard",
        description: 'Always computes every section — the frontend decides which to render based on the ranch production types it already has cached.',
    })
    @ApiParam({ name: 'idRanch', example: 1 })
    @ApiOkResponse({ type: DashboardStatsDto })
    async getDashboard(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ dashboard: DashboardStatsDto }> {
        const membership = await this.ranchUsersService.findOne(idUser, idRanch);
        if (!membership) throw new ForbiddenException({ message: 'Permiso denegado', error: 'PERMISSION_DENIED' });

        return { dashboard: await this.getDashboardStatsUseCase.execute(idRanch) };
    }
}
