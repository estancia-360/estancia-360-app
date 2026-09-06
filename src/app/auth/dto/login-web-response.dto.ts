import { ApiProperty } from '@nestjs/swagger';

export class OwnedRanchDto {
    @ApiProperty({ example: 5 })
    id: number;

    @ApiProperty({ example: 'Estancia La Esperanza' })
    name: string;
}

/**
 * Variante de LoginResponseDto solo para el panel web: en vez de idRanch
 * único (pensado para mobile, que asume una sola estancia por usuario)
 * devuelve todas las estancias donde el usuario es Owner, para que el panel
 * deje elegir con cuál entrar antes de aplicar la restricción de plan.
 */
export class LoginWebResponseDto {
    @ApiProperty({ example: 'Ingreso exitoso' })
    message: string;

    @ApiProperty({ description: 'Token de acceso JWT (único — sin refresh token)' })
    accessToken: string;

    @ApiProperty({ example: 15 })
    idUser: number;

    @ApiProperty({ example: 3 })
    idRole: number;

    @ApiProperty({ description: 'Nombre completo del usuario, para mostrar en el panel', example: 'Juan Carlos Pérez' })
    fullname: string;

    @ApiProperty({
        description: 'Estancias donde el usuario es Owner. Array vacío si no es dueño de ninguna — puede ser dueño de varias.',
        type: [OwnedRanchDto],
    })
    ranches: OwnedRanchDto[];
}
