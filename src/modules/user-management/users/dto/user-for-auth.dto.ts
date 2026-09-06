import { ApiHideProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { RoleDto } from 'src/modules/core/roles/dto/role.dto';

/**
 * DTO interno para operaciones de auth (login, cambio de contraseña).
 * Incluye password. Nunca usar esto en una respuesta HTTP.
 */
export class UserForAuthDto {
    @DtoField() id!: number;
    @DtoField() roleId!: number;
    @DtoField() email!: string;
    @DtoField() fullname!: string;
    @DtoField() isDeleted!: boolean;

    @ApiHideProperty()
    @DtoField()
    password!: string;

    @ApiHideProperty()
    @DtoField()
    resetCodeHash!: string | null;

    @ApiHideProperty()
    @DtoField()
    resetCodeExpiresAt!: Date | null;

    @DtoRelation(() => RoleDto)
    role!: RoleDto;
}
