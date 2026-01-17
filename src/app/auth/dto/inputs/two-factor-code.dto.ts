import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail } from "class-validator";

export class TwoFactorCodeDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario al que se enviará el código de verificación',
        example: 'usuario@ejemplo.com',
    })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe ser válido' })
    email: string;
}