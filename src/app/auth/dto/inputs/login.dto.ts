import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Email registrado para iniciar sesión.',
        example: 'juan@example.com',
    })
    @IsString({ message: 'El email debe ser un texto.' })
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    email: string;

    @ApiProperty({
        description: 'Contraseña asociada a la cuenta. Debe tener al menos 8 caracteres.',
        example: '12345678',
    })
    @IsString({ message: 'La contraseña debe ser un texto.' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    password: string;
}
