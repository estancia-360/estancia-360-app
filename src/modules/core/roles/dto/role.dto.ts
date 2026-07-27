import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class RoleDto {
    @DtoField()
    @ApiProperty({ example: 2 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Admin' })
    name!: string;
}
