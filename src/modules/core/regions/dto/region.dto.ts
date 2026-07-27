import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class RegionDto {
    @DtoField()
    @ApiProperty({ example: 7 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Santa Cruz' })
    name!: string;
}
