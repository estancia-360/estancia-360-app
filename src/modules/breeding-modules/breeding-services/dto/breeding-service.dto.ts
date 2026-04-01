import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

export class BreedingServiceDto {
    @ApiProperty({ description: 'ID del servicio de monta', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 5 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'ID del animal macho (null si IA sin toro identificado)', example: 12, nullable: true })
    @Expose()
    @Type(() => Number)
    idAnimalMale?: number;

    @ApiProperty({ description: 'Tipo de servicio', enum: ['natural', 'artificial_insemination', 'embryo_transfer'], example: 'natural' })
    @Expose()
    serviceType: string;

    @ApiProperty({ description: 'Raza del semen (para IA)', required: false, example: 'Angus' })
    @Expose()
    semenBreed?: string;

    @ApiProperty({ description: 'Nombre del técnico que realizó el servicio', required: false, example: 'Dr. Pérez' })
    @Expose()
    technician?: string;

    @ApiProperty({ description: 'Lote reproductivo', required: false, example: 'LOT-2026-01' })
    @Expose()
    reproductiveLot?: string;

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();

    @ApiProperty({ description: 'Animal macho utilizado (null si sin identificar)', type: RanchAnimalPlainDto, nullable: true })
    @Expose()
    @Type(() => RanchAnimalPlainDto)
    animalMale: RanchAnimalPlainDto = new RanchAnimalPlainDto();
}
