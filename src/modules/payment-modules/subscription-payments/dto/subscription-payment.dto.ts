import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaymentMethodEnum, PaymentSourceEnum } from '../entities/subscription-payment.entity';

export class SubscriptionPaymentDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    idRanchSubscription: number;

    @ApiProperty({ example: 100.0 })
    @Expose()
    @Type(() => Number)
    amount: number;

    @ApiProperty({ example: '2027-03-01' })
    @Expose()
    paymentDate: Date;

    @ApiProperty({ enum: PaymentMethodEnum })
    @Expose()
    paymentMethod: PaymentMethodEnum;

    @ApiProperty({ enum: PaymentSourceEnum })
    @Expose()
    paymentSource: PaymentSourceEnum;

    @ApiProperty({ required: false })
    @Expose()
    externalReference?: string;

    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    periodExtendedMonths: number;

    @ApiProperty({ required: false })
    @Expose()
    notes?: string;

    @ApiProperty({ required: false })
    @Expose()
    localId?: string;

    @ApiProperty()
    @Expose()
    createdAt: Date;
}
