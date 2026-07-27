import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class AnimalBreedDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Nelore' })
    name!: string;
}
