import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaymentMethodEnum, PaymentSourceEnum } from '../entities/subscription-payment.entity';

export class SubscriptionPaymentDto {
    @ApiProperty({ description: 'ID del pago', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID de la suscripción', example: 1 })
    @Expose()
    @Type(() => Number)
    idRanchSubscription: number;

    @ApiProperty({ description: 'Monto pagado (Bs)', example: 100.0 })
    @Expose()
    @Type(() => Number)
    amount: number;

    @ApiProperty({ description: 'Fecha del pago', example: '2027-03-01' })
    @Expose()
    paymentDate: Date;

    @ApiProperty({ description: 'Método de pago', enum: PaymentMethodEnum })
    @Expose()
    paymentMethod: PaymentMethodEnum;

    @ApiProperty({ description: 'Origen del registro', enum: PaymentSourceEnum })
    @Expose()
    paymentSource: PaymentSourceEnum;

    @ApiProperty({ description: 'Referencia del comprobante', required: false })
    @Expose()
    externalReference?: string;

    @ApiProperty({ description: 'Meses que este pago extiende la suscripción', example: 1 })
    @Expose()
    @Type(() => Number)
    periodExtendedMonths: number;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'Clave de idempotencia ante doble envío', required: false })
    @Expose()
    localId?: string;

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;
}
