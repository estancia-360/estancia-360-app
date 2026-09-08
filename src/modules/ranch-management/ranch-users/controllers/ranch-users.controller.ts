import { Controller, Get, Param, ParseIntPipe, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RanchUsersService } from '../services/ranch-users.service';
import { CreateRanchUserWorkerDto } from '../dto/create-ranch-user-worker.dto';
import { RanchUserWithUserDto } from '../dto/ranch-user-with-user.dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { RanchRolesEnum } from 'src/shared/enums';

/**
 * BUG-02 (auditoria QA E2E, 2026-09-03): este endpoint viejo no validaba que quien
 * llamara fuera el Owner de la estancia — cualquier usuario logueado podia agregarse
 * (o agregar a cualquier otro) como trabajador de cualquier estancia, saltando por
 * completo el aislamiento multi-tenant. Se agrego assertOwner en vez de retirar el
 * endpoint, para no romper al movil si todavia lo usa (existe un endpoint mas nuevo,
 * POST /ranch-users/ranch/:id/members en app/ranch-members/, que ya validaba bien).
 */
@ApiTags('Ranch Users')
@ApiBearerAuth('access-token')
@Controller('ranch-users')
export class RanchUsersController {
    constructor(private readonly ranchUsersService: RanchUsersService) {}

    @Post()
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add a worker to a ranch [OWNER ONLY]' })
    @ApiCreatedResponse({ schema: { example: { message: 'El usuario fue agregado como trabajador' } } })
    async create(@Body() dto: CreateRanchUserWorkerDto, @CurrentUser('id') idUser: number): Promise<{ message: string }> {
        await this.ranchUsersService.assertOwner(idUser, dto.idRanch);
        await this.ranchUsersService.create({
            idUser: dto.idUser,
            idRanch: dto.idRanch,
            idRanchRole: RanchRolesEnum.WORKER,
        });
        return { message: 'El usuario fue agregado como trabajador' };
    }

    // Ver el equipo no es exclusivo del Owner — un Administrador tiene el mismo acceso que el
    // Owner salvo lo reservado explícitamente (agregar/eliminar miembros, compras, ventas).
    @Get('ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List the members of a ranch (Owner, Workers, Administrators) [any active member]' })
    @ApiOkResponse({ type: [RanchUserWithUserDto] })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ members: RanchUserWithUserDto[] }> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return { members: await this.ranchUsersService.findAllByRanch(RanchUserWithUserDto, idRanch) };
    }
}
