import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';

export class WeaningDto {
    @ApiProperty({ description: 'ID del destete', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 8 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'Peso de la cría al destete (kg)', required: false, example: 120.5 })
    @Expose()
    weaningWeight?: number;

    @ApiProperty({ description: 'Edad de la cría en días al momento del destete', required: false, example: 180 })
    @Expose()
    ageDays?: number;

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();
}
