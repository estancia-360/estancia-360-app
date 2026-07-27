import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RanchUsersService } from '../services/ranch-users.service';
import { CreateRanchUserWorkerDto } from '../dto/create-ranch-user-worker.dto';
import { RanchUserWithUserDto } from '../dto/ranch-user-with-user.dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { RanchRolesEnum } from 'src/shared/enums';

/**
 * DEUDA TÉCNICA (igual que el proyecto viejo, coordinar con mobile antes de
 * tocar): no valida que quien llama sea el Owner de la estancia — solo exige
 * estar autenticado (mínimo razonable agregado acá). Cualquier usuario
 * logueado puede agregar a cualquier otro como trabajador de cualquier
 * estancia. RN-03 (solo el Owner agrega/quita Administradores) tampoco se
 * aplica todavía porque este endpoint solo agrega Workers.
 */
@ApiTags('Ranch Users')
@ApiBearerAuth('access-token')
@Controller('ranch-users')
export class RanchUsersController {
    constructor(private readonly ranchUsersService: RanchUsersService) {}

    @Post()
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add a worker to a ranch' })
    @ApiCreatedResponse({ schema: { example: { message: 'El usuario fue agregado como trabajador' } } })
    async create(@Body() dto: CreateRanchUserWorkerDto): Promise<{ message: string }> {
        await this.ranchUsersService.create({
            idUser: dto.idUser,
            idRanch: dto.idRanch,
            idRanchRole: RanchRolesEnum.WORKER,
        });
        return { message: 'El usuario fue agregado como trabajador' };
    }

    @Get('ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List the members of a ranch (Owner, Workers, Administrators) [OWNER ONLY]' })
    @ApiOkResponse({ type: [RanchUserWithUserDto] })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ members: RanchUserWithUserDto[] }> {
        if (!(await this.ranchUsersService.isOwner(idUser, idRanch))) {
            throw new ForbiddenException({ message: 'Solo el dueño de la estancia puede ver su equipo.', error: 'RANCH_OWNER_ONLY' });
        }
        return { members: await this.ranchUsersService.findAllByRanch(RanchUserWithUserDto, idRanch) };
    }
}
