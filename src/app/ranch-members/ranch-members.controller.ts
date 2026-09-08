import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { RegisterRanchMemberUseCase } from './use-cases/register-ranch-member.use-case';
import { RemoveRanchMemberUseCase } from './use-cases/remove-ranch-member.use-case';
import { RegisterRanchMemberDto } from './dto/inputs/register-ranch-member.dto';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';

// Comparte el prefijo "ranch-users" con modules/ranch-management/ranch-users
// (que solo expone GET y el POST viejo sin gate de Owner, deuda técnica
// heredada — no se toca para no romper mobile). Estas rutas nuevas sí exigen
// que quien llama sea el Owner de la estancia.
@ApiTags('Ranch Members')
@ApiBearerAuth('access-token')
@Controller('ranch-users')
export class RanchMembersController {
    constructor(
        private readonly registerRanchMemberUseCase: RegisterRanchMemberUseCase,
        private readonly removeRanchMemberUseCase: RemoveRanchMemberUseCase,
    ) {}

    @Post('ranch/:idRanch/members')
    @UserUp()
    @ApiOperation({
        summary: 'Add a new administrator to the ranch [OWNER ONLY]',
        description:
            'Creates the user account and links it to the ranch as Administrator in one step (never Owner — that is only assigned when the ranch is created). There is no assignable Worker role anymore: a ranch only has an Owner and, optionally, Administrators.',
    })
    async registerMember(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Body() dto: RegisterRanchMemberDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ member: UserDto }> {
        return { member: await this.registerRanchMemberUseCase.execute(idRanch, dto, idUser) };
    }

    @Delete('ranch/:idRanch/members/:idTargetUser')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove an administrator from the ranch [OWNER ONLY]',
        description: 'Soft-deletes the membership. The Owner can never be removed this way.',
    })
    async removeMember(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Param('idTargetUser', ParseIntPipe) idTargetUser: number,
        @CurrentUser('id') idUser: number,
    ): Promise<void> {
        await this.removeRanchMemberUseCase.execute(idRanch, idTargetUser, idUser);
    }
}
