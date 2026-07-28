import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({ example: 'Ingreso exitoso' })
    message: string;

    @ApiProperty({ description: 'Token de acceso JWT (único — sin refresh token)' })
    accessToken: string;

    @ApiProperty({ example: 15 })
    idUser: number;

    @ApiProperty({ example: 3 })
    idRole: number;

    @ApiPropertyOptional({
        description: 'ID de la estancia donde el usuario es Owner. null si no es dueño de ninguna.',
        example: 5,
        nullable: true,
    })
    idRanch: number | null;
}
