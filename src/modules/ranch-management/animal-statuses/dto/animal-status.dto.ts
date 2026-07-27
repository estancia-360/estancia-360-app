import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class AnimalStatusDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Activo' })
    name!: string;
}
