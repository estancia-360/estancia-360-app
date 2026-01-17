import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail } from "class-validator";

export class ChangePasswordDto {

    @ApiProperty({
        description: 'Correo electrónico del usuario que solicita el cambio de contraseña.',
        example: 'usuario@gmail.com',
    })
    @IsString({ message: 'El correo debe ser un texto válido.' })
    @IsNotEmpty({ message: 'El correo no puede estar vacío.' })
    @IsEmail({}, { message: 'El correo proporcionado no es válido.' })
    @MaxLength(150, {
        message: 'El correo no puede tener más de 150 caracteres.',
    })
    email: string

    @ApiProperty({
        description: 'Nueva contraseña del usuario. Debe tener entre 8 y 20 caracteres.',
        example: 'MiNuevaPass123',
    })
    @IsString({ message: 'La contraseña debe ser un texto válido.' })
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
    @MinLength(8, {
        message: 'La contraseña debe tener al menos 8 caracteres.',
    })
    @MaxLength(20, {
        message: 'La contraseña no puede tener más de 20 caracteres.',
    })
    password: string;
}
