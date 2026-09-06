import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserDto } from '../dto/user.dto';
import { UserWithRanchesDto } from '../dto/user-with-ranches.dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound, ApiUnauthorized } from 'src/shared/utils/swagger';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

/**
 * Error dictionary for this module:
 *   USER_NOT_FOUND   404 — No user with the given ID exists or it was deleted.
 *   INVALID_TOKEN    401 — JWT is missing, malformed, or expired.
 *   USER_ACCESS_DENIED 403 — target user is neither yourself nor someone sharing a ranch with you.
 */
@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    // BUG-09 (auditoria QA E2E, 2026-09-03): estas dos rutas dejaban leer los datos de
    // CUALQUIER usuario (la segunda incluye sus estancias y rol en cada una) con solo
    // autenticarse y adivinar un idUser — enumeracion libre. Ahora se restringe a "uno
    // mismo" o "alguien que comparte una estancia conmigo" (ver assertSharesRanchOrSelf).
    @Get(':idUser')
    @UserUp()
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiOkResponse({ type: UserDto })
    @ApiNotFound({ code: 'USER_NOT_FOUND', message: 'User not found.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    // El viejo envuelve la respuesta en { user: ... } — se mantiene igual acá para
    // no romper el parseo del móvil, aunque difiera del estilo del resto del scaffold.
    async findOneById(@Param('idUser', ParseIntPipe) idUser: number, @CurrentUser('id') currentUserId: number): Promise<{ user: UserDto }> {
        await this.ranchUsersService.assertSharesRanchOrSelf(currentUserId, idUser);
        return { user: await this.usersService.findOneById(UserDto, idUser) };
    }

    @Get('ranches/:idUser')
    @UserUp()
    @ApiOperation({ summary: 'Get a user with the ranches they belong to and their role in each' })
    @ApiOkResponse({ type: UserWithRanchesDto })
    @ApiNotFound({ code: 'USER_NOT_FOUND', message: 'User not found.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    async findUserWithRanches(
        @Param('idUser', ParseIntPipe) idUser: number,
        @CurrentUser('id') currentUserId: number,
    ): Promise<{ user: UserWithRanchesDto }> {
        await this.ranchUsersService.assertSharesRanchOrSelf(currentUserId, idUser);
        return { user: await this.usersService.findOneById(UserWithRanchesDto, idUser) };
    }
}
