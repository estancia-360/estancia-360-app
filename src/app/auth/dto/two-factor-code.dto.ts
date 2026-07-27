import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class TwoFactorCodeDto {
    @ApiProperty({ description: 'Correo al que se envía el código de verificación', example: 'usuario@email.com' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe ser válido' })
    email: string;
}
