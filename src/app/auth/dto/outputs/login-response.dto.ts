import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({
        description: 'Mensaje indicando que el ingreso fue exitoso.',
        example: 'Ingreso exitoso',
    })
    message: string;

    @ApiProperty({
        description: 'Token de acceso JWT para autenticación en el sistema.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Identificador único del usuario que ha iniciado sesión.',
        example: 15,
    })
    idUser: number;

    @ApiProperty({
        description: 'Identificador del rol asignado al usuario.',
        example: 2,
    })
    idRole: number;

    @ApiPropertyOptional({
        description: 'Identificador de la estancia donde el usuario es dueño (Owner). Será null si el usuario no es dueño de ninguna estancia.',
        example: 5,
        nullable: true,
    })
    idRanch?: number | null;
}
