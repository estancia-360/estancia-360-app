import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { SystemTypeEnum } from '../entities/fattening-entry.entity';

export class FatteningEntryDto {
    @ApiProperty({ description: 'ID del registro de ingreso a engorde', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 14 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'Peso inicial al ingresar al engorde (kg)', example: 220.0, nullable: true })
    @Expose()
    @Type(() => Number)
    initialWeight?: number;

    @ApiProperty({ description: 'Sistema de engorde', enum: SystemTypeEnum, example: SystemTypeEnum.FEEDLOT })
    @Expose()
    systemType: SystemTypeEnum;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2026-07-01T10:00:00.000Z' })
    @Expose()
    createdAt: Date;
}
