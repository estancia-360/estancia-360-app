import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class RanchRoleDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Owner' })
    name!: string;
}
