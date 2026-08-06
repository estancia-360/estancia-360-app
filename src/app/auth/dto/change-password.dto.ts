import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ description: 'Contraseña actual del usuario autenticado', example: 'MiPassActual123' })
    @IsString({ message: 'La contraseña actual debe ser un texto válido.' })
    @IsNotEmpty({ message: 'La contraseña actual no puede estar vacía.' })
    currentPassword: string;

    @ApiProperty({ description: 'Nueva contraseña', example: 'MiNuevaPass123' })
    @IsString({ message: 'La contraseña debe ser un texto válido.' })
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    @MaxLength(20, { message: 'La contraseña no puede tener más de 20 caracteres.' })
    password: string;
}
