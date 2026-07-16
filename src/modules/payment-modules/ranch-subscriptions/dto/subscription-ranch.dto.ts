import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SubscriptionRanchDto {
    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'Nombre de la estancia', example: 'Estancia Test Fixture' })
    @Expose()
    name: string;
}
