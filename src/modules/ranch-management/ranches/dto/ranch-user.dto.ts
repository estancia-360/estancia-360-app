import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RanchRoleDto } from 'src/modules/core/ranch-roles/dto/ranch-role.dto';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';

/**
 * DTO para mostrar un usuario asignado a una estancia con su rol específico.
 * Mapea la relación RanchUser → User + RanchRole
 */
export class RanchUserDto {

    idUser: number

    idRanch: number

    idRole: number

    @ApiProperty({
        description: 'Datos del usuario asignado a la estancia',
        type: UserDto,
    })
    @Expose()
    @Type(() => UserDto)
    user: UserDto = new UserDto();

    @ApiProperty({
        description: 'Rol que desempeña el usuario en esta estancia',
        type: RanchRoleDto,
    })
    @Expose()
    @Type(() => RanchRoleDto)
    role: RanchRoleDto = new RanchRoleDto();

    @ApiProperty({
        description: 'Salario del usuario en esta estancia (si aplica)',
        example: 5000.00,
        required: false,
        nullable: true,
    })
    @Expose()
    salary?: number;
}
