import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class AnimalDeclaredHistoryDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 10 })
    idRanchAnimal!: number;

    @DtoField()
    @ApiProperty({ example: 3, required: false })
    prevBirthsCount?: number;

    @DtoField()
    @ApiProperty({ example: 2024, required: false })
    prevLastBirthYear?: number;

    @DtoField()
    @ApiProperty({ example: 115.5, required: false })
    prevAvgWeaningWeight?: number;

    @DtoField()
    @ApiProperty({ example: 'Animal comprado con historial verbal del vendedor', required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ example: '2026-01-20T14:30:00.000Z' })
    createdAt!: Date;
}
