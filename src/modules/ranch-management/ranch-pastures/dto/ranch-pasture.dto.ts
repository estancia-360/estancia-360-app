import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class RanchPastureDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idRanch!: number;

    @DtoField()
    @ApiProperty({ example: 'Potrero Norte' })
    name!: string;

    @DtoField()
    @ApiProperty({ example: 15.5 })
    areaHectares!: number;

    @DtoField()
    @ApiProperty({ example: 'Campo natural con agua permanente', required: false })
    description?: string;

    @DtoField()
    @ApiProperty({ example: true })
    isActive!: boolean;

    @DtoField()
    @ApiProperty({ example: '2026-01-20T14:30:00.000Z' })
    createdAt!: Date;

    @DtoField()
    @ApiProperty({ example: '2026-01-22T10:15:00.000Z' })
    updatedAt!: Date;
}
