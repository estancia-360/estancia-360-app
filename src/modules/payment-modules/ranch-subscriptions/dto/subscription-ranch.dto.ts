import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class SubscriptionRanchProductionTypeDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ example: 'Cria' })
    @Expose()
    name: string;
}

export class SubscriptionRanchDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ example: 'Estancia Test Fixture' })
    @Expose()
    name: string;

    // Rubros habilitados — el panel web los usa para mostrar solo los módulos
    // que aplican a esta estancia (RN-09: nunca Engorde sin Recría, ni Recría sin Cría).
    @ApiProperty({ type: [SubscriptionRanchProductionTypeDto] })
    @Expose()
    @Type(() => SubscriptionRanchProductionTypeDto)
    productionTypes: SubscriptionRanchProductionTypeDto[];
}
