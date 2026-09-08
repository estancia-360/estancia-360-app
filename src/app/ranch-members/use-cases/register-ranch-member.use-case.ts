import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterRanchMemberDto } from '../dto/inputs/register-ranch-member.dto';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';
import { RoleEnum, RanchRolesEnum } from 'src/shared/enums';

@Injectable()
export class RegisterRanchMemberUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly usersService: UsersService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(idRanch: number, dto: RegisterRanchMemberDto, requestingUserId: number): Promise<UserDto> {
        if (!(await this.ranchUsersService.isOwner(requestingUserId, idRanch))) {
            throw new ForbiddenException({ message: 'Solo el dueño de la estancia puede agregar miembros.', error: 'RANCH_OWNER_ONLY' });
        }

        return await this.dataSource.transaction(async (manager) => {
            const user = await this.usersService.create(
                UserDto,
                {
                    roleId: RoleEnum.USER,
                    ci: dto.ci,
                    fullname: dto.fullname,
                    paternalSurname: dto.paternalSurname,
                    maternalSurname: dto.maternalSurname,
                    email: dto.email,
                    password: dto.password,
                    celphone: dto.celphone,
                },
                { manager },
            );

            await this.ranchUsersService.create(
                { idUser: user.id, idRanch, idRanchRole: RanchRolesEnum.ADMINISTRATOR },
                manager,
            );

            return user;
        });
    }
}
