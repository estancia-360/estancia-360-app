import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { RegisterRanchMemberUseCase } from './use-cases/register-ranch-member.use-case';
import { RegisterRanchMemberDto } from './dto/inputs/register-ranch-member.dto';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';

// Comparte el prefijo "ranch-users" con modules/ranch-management/ranch-users
// (que solo expone GET y el POST viejo sin gate de Owner, deuda técnica
// heredada — no se toca para no romper mobile). Esta ruta nueva sí exige
// que quien llama sea el Owner de la estancia.
@ApiTags('Ranch Members')
@ApiBearerAuth('access-token')
@Controller('ranch-users')
export class RanchMembersController {
    constructor(private readonly registerRanchMemberUseCase: RegisterRanchMemberUseCase) {}

    @Post('ranch/:idRanch/members')
    @UserUp()
    @ApiOperation({
        summary: 'Add a new worker or administrator to the ranch [OWNER ONLY]',
        description: 'Creates the user account and links it to the ranch in one step, with the chosen ranch role (never Owner — that is only assigned when the ranch is created).',
    })
    async registerMember(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Body() dto: RegisterRanchMemberDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ member: UserDto }> {
        return { member: await this.registerRanchMemberUseCase.execute(idRanch, dto, idUser) };
    }
}
