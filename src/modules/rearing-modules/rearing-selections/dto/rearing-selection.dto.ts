import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { RearingDestinationEnum } from '../entities/rearing-selection.entity';

export class RearingSelectionDto {
    @ApiProperty({ description: 'ID de la selección de recría', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 6 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'ID del lote de destino', example: 4, nullable: true })
    @Expose()
    @Type(() => Number)
    idLotDest?: number;

    @ApiProperty({ description: 'Destino del animal tras la selección', enum: RearingDestinationEnum, example: RearingDestinationEnum.REPLACEMENT })
    @Expose()
    destination: RearingDestinationEnum;

    @ApiProperty({ description: 'Peso del animal en el momento de la selección (kg)', example: 200.0, nullable: true })
    @Expose()
    @Type(() => Number)
    weightAtSelection?: number;

    @ApiProperty({ description: 'Condición corporal al momento de la selección (1-5)', example: 3, nullable: true })
    @Expose()
    @Type(() => Number)
    bodyCondition?: number;

    @ApiProperty({ description: 'Puntuación genética del animal (0-10)', example: 7.5, nullable: true })
    @Expose()
    @Type(() => Number)
    geneticScore?: number;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2026-06-01T10:00:00.000Z' })
    @Expose()
    createdAt: Date;
}
