import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class ProductionTypeDto {
    @DtoField()
    @ApiProperty({ example: 3 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Cria' })
    name!: string;
}
