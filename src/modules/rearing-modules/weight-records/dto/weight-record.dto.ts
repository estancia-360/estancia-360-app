import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { WeightTypeEnum } from '../entities/weight-record.entity';

export class WeightRecordDto {
    @ApiProperty({ description: 'ID del registro de peso', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 5 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'ID del lote del animal en el momento del pesaje', example: 3 })
    @Expose()
    @Type(() => Number)
    idLot: number;

    @ApiProperty({ description: 'Peso registrado en kg', example: 185.5 })
    @Expose()
    @Type(() => Number)
    weight: number;

    @ApiProperty({ description: 'Tipo de pesaje', enum: WeightTypeEnum, example: WeightTypeEnum.SCALE })
    @Expose()
    weightType: WeightTypeEnum;

    @ApiProperty({ description: 'Condición corporal del animal (1-5)', example: 3, nullable: true })
    @Expose()
    @Type(() => Number)
    bodyCondition?: number;

    @ApiProperty({ description: 'Edad del animal en días al momento del pesaje', example: 180, nullable: true })
    @Expose()
    @Type(() => Number)
    ageDays?: number;

    @ApiProperty({ description: 'Notas adicionales', nullable: true })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2026-05-01T10:00:00.000Z' })
    @Expose()
    createdAt: Date;
}
