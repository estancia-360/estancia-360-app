import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserDto } from '../dto/user.dto';
import { UserWithRanchesDto } from '../dto/user-with-ranches.dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound, ApiUnauthorized } from 'src/shared/utils/swagger';

/**
 * Error dictionary for this module:
 *   USER_NOT_FOUND   404 — No user with the given ID exists or it was deleted.
 *   INVALID_TOKEN    401 — JWT is missing, malformed, or expired.
 */
@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // El viejo no tenía ningún guard acá (cualquiera podía leer datos de cualquier
    // usuario por ID) — se le agrega UserUp() como mínimo razonable de "todo tiene
    // seguridad" sin depender de un modelo de permisos más fino que no existe todavía.
    @Get(':idUser')
    @UserUp()
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiOkResponse({ type: UserDto })
    @ApiNotFound({ code: 'USER_NOT_FOUND', message: 'User not found.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    // El viejo envuelve la respuesta en { user: ... } — se mantiene igual acá para
    // no romper el parseo del móvil, aunque difiera del estilo del resto del scaffold.
    async findOneById(@Param('idUser', ParseIntPipe) idUser: number): Promise<{ user: UserDto }> {
        return { user: await this.usersService.findOneById(UserDto, idUser) };
    }

    @Get('ranches/:idUser')
    @UserUp()
    @ApiOperation({ summary: 'Get a user with the ranches they belong to and their role in each' })
    @ApiOkResponse({ type: UserWithRanchesDto })
    @ApiNotFound({ code: 'USER_NOT_FOUND', message: 'User not found.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    async findUserWithRanches(@Param('idUser', ParseIntPipe) idUser: number): Promise<{ user: UserWithRanchesDto }> {
        return { user: await this.usersService.findOneById(UserWithRanchesDto, idUser) };
    }
}
