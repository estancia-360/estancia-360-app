import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorCodeResponseDto {
    @ApiProperty({ description: 'Código de verificación de 6 dígitos', example: 123456 })
    code: number;
}
