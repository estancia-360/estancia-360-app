import { ApiProperty } from '@nestjs/swagger';

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
}
