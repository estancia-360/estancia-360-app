import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserDto } from '../dto/user.dto';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { AdminUp } from 'src/app/auth/decorators';
import { ApiConflict, ApiValidationError } from 'src/shared/utils/swagger';
import { RoleEnum } from 'src/shared/enums';

/**
 * Real admin-gated user management — distinct from POST /auth/register
 * (public, accepts any roleId, kept as documented tech debt matching the
 * old project). Creating an admin here requires an admin to already be
 * logged in, and the role is always ADMIN — never client-chosen.
 */
@ApiTags('Admin — Users')
@ApiBearerAuth('access-token')
@Controller('admin/users')
export class AdminUsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @AdminUp()
    @ApiOperation({ summary: 'List admin-team users (Root + Admin) [ADMIN]' })
    @ApiOkResponse({ type: [UserDto] })
    async findAllAdmins(): Promise<{ users: UserDto[] }> {
        return { users: await this.usersService.findAllAdmins(UserDto) };
    }

    @Post()
    @AdminUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new admin user [ADMIN]', description: 'The role is always Admin — this endpoint never accepts a client-chosen roleId.' })
    @ApiOkResponse({ type: UserDto })
    @ApiConflict({ code: 'USER_ALREADY_EXISTS', message: 'A user with this email or CI already exists.' })
    @ApiValidationError()
    async createAdmin(@Body() dto: CreateAdminUserDto): Promise<{ user: UserDto }> {
        const user = await this.usersService.create(UserDto, { ...dto, roleId: RoleEnum.ADMIN } as CreateUserDto);
        return { user };
    }
}
