import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({ description: 'Correo del usuario que solicitó la recuperación', example: 'usuario@email.com' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe ser válido' })
    email: string;

    @ApiProperty({ description: 'Código de 6 dígitos enviado por correo', example: '123456' })
    @IsString({ message: 'El código debe ser texto' })
    @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
    code: string;

    @ApiProperty({ description: 'Nueva contraseña', example: 'MiNuevaPass123' })
    @IsString({ message: 'La contraseña debe ser un texto válido.' })
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    @MaxLength(20, { message: 'La contraseña no puede tener más de 20 caracteres.' })
    password: string;
}
