import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class CountryDto {
    @DtoField()
    @ApiProperty({ example: 5 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Bolivia' })
    name!: string;
}
