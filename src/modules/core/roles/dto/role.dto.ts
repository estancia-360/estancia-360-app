import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoleDto {
    @ApiProperty({
        description: 'Identificador único del rol.',
        example: 2,
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: 'Nombre del rol asignado al usuario.',
        example: 'Administrador',
    })
    @Expose()
    name: string;
}