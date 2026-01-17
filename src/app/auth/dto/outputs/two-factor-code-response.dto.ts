import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class TwoFactorCodeResponseDto {
    @ApiProperty({
        description: 'Código de verificación de 6 dígitos enviado al usuario',
        example: 123456,
    })
    @IsNumber({}, { message: 'El código debe ser un número' })
    code: number;
}