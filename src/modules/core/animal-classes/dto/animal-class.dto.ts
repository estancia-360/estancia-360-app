import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class AnimalClassDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Vaca' })
    name!: string;

    @DtoField()
    @ApiProperty({ enum: ['F', 'M'], example: 'F' })
    sex!: 'F' | 'M';

    @DtoField()
    @ApiProperty({ example: true })
    isActive!: boolean;
}
