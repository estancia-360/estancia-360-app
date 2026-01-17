import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RoleDto } from 'src/modules/core/roles/dto/role.dto';

export class UserDto {
    @ApiProperty({
        description: 'ID del usuario',
        example: 1,
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: 'ID del rol asignado al usuario',
        example: 2,
    })
    @Expose()
    idRole: number;

    @ApiProperty({
        description: 'Carnet de identidad del usuario',
        example: '12345678',
    })
    @Expose()
    ci: string;

    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Carlos Pérez',
    })
    @Expose()
    fullname: string;

    @ApiProperty({
        description: 'Apellido paterno',
        example: 'Pérez',
    })
    @Expose()
    paternalSurname: string;

    @ApiProperty({
        description: 'Apellido materno',
        example: 'Gómez',
    })
    @Expose()
    maternalSurname: string;

    @ApiProperty({
        description: 'Correo electrónico',
        example: 'usuario@email.com',
    })
    @Expose()
    email: string;

    @ApiProperty({
        description: 'Número de celular',
        example: '78945612',
        required: false,
    })
    @Expose()
    celphone?: string;

    @ApiProperty({
        description: 'Indica si el usuario está eliminado lógicamente',
        example: false,
    })
    @Expose()
    isDeleted: boolean;

    @ApiProperty({
        description: 'Fecha de creación',
        example: '2025-01-01T10:00:00.000Z',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        example: '2025-01-10T15:30:00.000Z',
    })
    @Expose()
    updatedAt: Date;

    @Expose()
    @Type(() => RoleDto)
    role: RoleDto = new RoleDto()
}
