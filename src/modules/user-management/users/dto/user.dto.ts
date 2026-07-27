import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { RoleDto } from 'src/modules/core/roles/dto/role.dto';

export class UserDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 2, description: 'ID del rol asignado al usuario' })
    roleId!: number;

    @DtoField()
    @ApiProperty({ example: '12345678', description: 'Carnet de identidad' })
    ci!: string;

    @DtoField()
    @ApiProperty({ example: 'Juan Carlos Pérez' })
    fullname!: string;

    @DtoField()
    @ApiProperty({ example: 'Pérez' })
    paternalSurname!: string;

    @DtoField()
    @ApiProperty({ example: 'Gómez' })
    maternalSurname!: string;

    @DtoField()
    @ApiProperty({ example: 'usuario@email.com' })
    email!: string;

    @DtoField()
    @ApiProperty({ example: '78945612', required: false, nullable: true })
    celphone!: string | null;

    @DtoField()
    @ApiProperty({ example: false })
    isDeleted!: boolean;

    @DtoField()
    @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
    createdAt!: Date;

    @DtoField()
    @ApiProperty({ example: '2026-01-10T15:30:00.000Z' })
    updatedAt!: Date;

    @DtoRelation(() => RoleDto)
    @ApiProperty({ type: () => RoleDto })
    role!: RoleDto;
}
