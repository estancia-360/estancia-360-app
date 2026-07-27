import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class CityDto {
    @DtoField()
    @ApiProperty({ example: 15 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Santa Cruz de la Sierra' })
    name!: string;
}
