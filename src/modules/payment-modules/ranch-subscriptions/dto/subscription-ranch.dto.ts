import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SubscriptionRanchDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ example: 'Estancia Test Fixture' })
    @Expose()
    name: string;
}
