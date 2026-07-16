import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SubscriptionPlanDto {
    @ApiProperty({ description: 'ID del plan', example: 2 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'Nombre del plan', example: 'Estancia' })
    @Expose()
    name: string;

    @ApiProperty({ description: 'Capacidad mínima de animales', example: 31 })
    @Expose()
    @Type(() => Number)
    capacityMin: number;

    @ApiProperty({ description: 'Capacidad máxima de animales (null = sin límite)', required: false, nullable: true })
    @Expose()
    @Type(() => Number)
    capacityMax?: number;

    @ApiProperty({ description: 'Precio mensual (Bs)', example: 100.0 })
    @Expose()
    @Type(() => Number)
    priceMonthly: number;

    @ApiProperty({ description: 'Precio anual (Bs)', example: 1000.0 })
    @Expose()
    @Type(() => Number)
    priceAnnual: number;

    @ApiProperty({ description: 'Días de prueba gratuita', example: 7 })
    @Expose()
    @Type(() => Number)
    trialDays: number;

    @ApiProperty({ description: 'Si el plan está disponible para asignarse', example: true })
    @Expose()
    isActive: boolean;
}
