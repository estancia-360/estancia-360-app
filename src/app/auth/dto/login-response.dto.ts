import { ApiProperty } from '@nestjs/swagger';

export class OwnedRanchDto {
    @ApiProperty({ example: 5 })
    id: number;

    @ApiProperty({ example: 'Estancia La Esperanza' })
    name: string;
}

export class LoginResponseDto {
    @ApiProperty({ example: 'Ingreso exitoso' })
    message: string;

    @ApiProperty({ description: 'Token de acceso JWT (único — sin refresh token)' })
    accessToken: string;

    @ApiProperty({ example: 15 })
    idUser: number;

    @ApiProperty({ example: 3 })
    idRole: number;

    @ApiProperty({
        description: 'Estancias donde el usuario es Owner. Array vacío si no es dueño de ninguna — puede ser dueño de varias.',
        type: [OwnedRanchDto],
    })
    ranches: OwnedRanchDto[];
}
