import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentMethodEnum } from 'src/modules/payment-modules/subscription-payments/entities/subscription-payment.entity';

export class RegisterSubscriptionPaymentDto {
    @ApiProperty({ description: 'Monto pagado (Bs)', example: 100.0 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    amount: number;

    @ApiProperty({ description: 'Fecha en que se recibió el pago', example: '2027-03-01' })
    @IsDateString()
    paymentDate: Date;

    @ApiProperty({ description: 'Método de pago', enum: PaymentMethodEnum, example: PaymentMethodEnum.QR })
    @IsEnum(PaymentMethodEnum)
    paymentMethod: PaymentMethodEnum;

    @ApiProperty({
        description: 'Meses que este pago extiende la suscripción. No se deriva automático del ciclo — permite cargar promociones (ej. paga 3, recibe 4) sin caso especial.',
        example: 1,
    })
    @IsInt()
    @IsPositive()
    periodExtendedMonths: number;

    @ApiProperty({ description: 'Referencia del comprobante recibido', required: false })
    @IsOptional()
    @IsString()
    externalReference?: string;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        description: 'Clave de idempotencia generada por el cliente (ej. UUID). Si se reenvía el mismo valor, el backend devuelve el estado actual sin volver a extender el período — protege contra doble clic en "Registrar pago".',
        required: false,
    })
    @IsOptional()
    @IsString()
    localId?: string;
}
