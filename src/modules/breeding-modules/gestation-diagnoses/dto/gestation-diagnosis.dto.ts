import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';

export class GestationDiagnosisDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 6 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 3 })
    idService!: number;

    @DtoField()
    @ApiProperty({ enum: ['palpation', 'ultrasound'], example: 'ultrasound' })
    method!: string;

    @DtoField()
    @ApiProperty({ enum: ['pregnant', 'empty'], example: 'pregnant' })
    result!: string;

    @DtoField()
    @ApiProperty({ example: 45, required: false })
    gestationDays?: number;

    @DtoField()
    @ApiProperty({ example: '2026-09-15', required: false })
    estimatedBirth?: Date;

    @DtoField()
    @ApiProperty({ example: 'Dr. López', required: false })
    veterinarian?: string;

    @DtoField()
    @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;
}
