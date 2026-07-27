import {
    Controller, Get, Post, Put, Delete,
    Body, Param, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation,
    ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse,
} from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { RoleDto } from '../dto/role.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { FindAllRolesResponseDto } from '../dto/find-all-roles-response.dto';
import { AdminUp, RootOnly, Public } from 'src/app/auth/decorators';
import { ApiNotFound, ApiUnauthorized, ApiValidationError, ApiConflict } from 'src/shared/utils/swagger';

/**
 * Error dictionary for this module:
 *   ROLE_NOT_FOUND        404 — No role with the given ID exists.
 *   ROLE_ALREADY_EXISTS   409 — A role with this name already exists.
 *   INVALID_TOKEN         401 — JWT is missing, malformed, or expired.
 *   INSUFFICIENT_PERMISSIONS 403 — Authenticated but role does not meet the endpoint requirement.
 */
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    // Público como en el viejo: el form de registro necesita listar roles antes
    // de que el usuario tenga sesión. Es solo id+nombre, no hay dato sensible.
    @Get()
    @Public()
    @ApiOperation({
        summary:     'List roles',
        description: 'Returns the full role catalog (unpaginated — this is a small, static table).',
    })
    @ApiOkResponse({ type: FindAllRolesResponseDto })
    async findAll(): Promise<FindAllRolesResponseDto> {
        return { roles: await this.rolesService.findAll(RoleDto) };
    }

    @Get(':id')
    @AdminUp()
    @ApiOperation({
        summary:     'Get a role by ID',
        description: 'Returns a single role by its numeric ID. Requires admin role or higher.',
    })
    @ApiOkResponse({ type: RoleDto })
    @ApiNotFound({ code: 'ROLE_NOT_FOUND', message: 'Role not found.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleDto> {
        return await this.rolesService.findOneById(RoleDto, id);
    }

    @Post()
    @AdminUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary:     'Create a role',
        description: 'Creates a new role. The name must be unique.',
    })
    @ApiCreatedResponse({ type: RoleDto })
    @ApiValidationError()
    @ApiConflict({ code: 'ROLE_ALREADY_EXISTS', message: 'A role with this name already exists.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    async create(@Body() dto: CreateRoleDto): Promise<RoleDto> {
        return await this.rolesService.create(RoleDto, dto);
    }

    @Put(':id')
    @AdminUp()
    @ApiOperation({
        summary:     'Update a role',
        description: 'Updates the role name. The new name must not be taken by another role.',
    })
    @ApiOkResponse({ type: RoleDto })
    @ApiValidationError()
    @ApiNotFound({ code: 'ROLE_NOT_FOUND', message: 'Role not found.' })
    @ApiConflict({ code: 'ROLE_ALREADY_EXISTS', message: 'A role with this name already exists.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoleDto,
    ): Promise<RoleDto> {
        return await this.rolesService.update(RoleDto, id, dto);
    }

    @Delete(':id')
    @RootOnly()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary:     'Delete a role',
        description: 'Permanently deletes a role. Requires root. Ensure no users have this role assigned before deleting.',
    })
    @ApiNoContentResponse({ description: 'Role deleted successfully.' })
    @ApiNotFound({ code: 'ROLE_NOT_FOUND', message: 'Role not found.' })
    @ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.rolesService.remove(id);
    }
}
