import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentMethodEnum } from 'src/modules/payment-modules/subscription-payments/entities/subscription-payment.entity';

export class RegisterSubscriptionPaymentDto {
    @ApiProperty({ example: 100.0 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    amount: number;

    @ApiProperty({ example: '2027-03-01' })
    @IsDateString()
    paymentDate: Date;

    @ApiProperty({ enum: PaymentMethodEnum, example: PaymentMethodEnum.QR })
    @IsEnum(PaymentMethodEnum)
    paymentMethod: PaymentMethodEnum;

    @ApiProperty({
        description: 'Months this payment extends the subscription. Not derived automatically from the billing cycle — allows manual promos (e.g. pay 3, get 4) without a special case.',
        example: 1,
    })
    @IsInt()
    @IsPositive()
    periodExtendedMonths: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    externalReference?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        description: 'Client-generated idempotency key. Resending the same value returns the current state without extending the period again — guards against double-click on "Register payment".',
        required: false,
    })
    @IsOptional()
    @IsString()
    localId?: string;
}
