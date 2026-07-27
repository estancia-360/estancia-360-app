import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class RanchAnimalPlainDto {
    @DtoField()
    @ApiProperty({ example: 10 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idRanch!: number;

    @DtoField()
    @ApiProperty({ example: 1, nullable: true, required: false })
    idProductiveStatus?: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idAnimalClass!: number;

    @DtoField()
    @ApiProperty({ example: 'AR-000123' })
    code!: string;

    @DtoField()
    @ApiProperty({ example: '2023-05-10' })
    birthdate!: Date;

    @DtoField()
    @ApiProperty({ example: 350.75, required: false })
    weight?: number;

    @DtoField()
    @ApiProperty({ enum: ['F', 'M'], example: 'F' })
    sex!: 'F' | 'M';

    @DtoField()
    @ApiProperty({ example: '2026-01-20T14:30:00.000Z' })
    createdAt!: Date;
}
