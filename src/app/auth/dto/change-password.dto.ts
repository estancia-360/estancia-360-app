import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

// DEUDA TÉCNICA (a propósito, ver AuthService.changePassword): sin verificar contraseña
// actual, y el endpoint no exige JWT — igual que en el proyecto viejo, a coordinar con mobile.
export class ChangePasswordDto {
    @ApiProperty({ description: 'Correo del usuario que solicita el cambio', example: 'usuario@email.com' })
    @IsEmail({}, { message: 'El correo proporcionado no es válido.' })
    @IsNotEmpty({ message: 'El correo no puede estar vacío.' })
    @MaxLength(150)
    email: string;

    @ApiProperty({ description: 'Nueva contraseña', example: 'MiNuevaPass123' })
    @IsString({ message: 'La contraseña debe ser un texto válido.' })
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    @MaxLength(20, { message: 'La contraseña no puede tener más de 20 caracteres.' })
    password: string;
}
