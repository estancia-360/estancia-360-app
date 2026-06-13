import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

export class ParturitionDto {
    @ApiProperty({ description: 'ID del parto', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 7 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'ID del diagnóstico de gestación que originó este parto', example: 2 })
    @Expose()
    @Type(() => Number)
    idDiagnosis: number;

    @ApiProperty({ description: 'ID del animal cría creado (null si nació muerto)', example: 20, nullable: true })
    @Expose()
    @Type(() => Number)
    idCria?: number;

    @ApiProperty({ description: 'Tipo de parto', enum: ['normal', 'assisted', 'cesarean'], example: 'normal' })
    @Expose()
    birthType: string;

    @ApiProperty({ description: 'Peso de la cría al nacer (kg)', required: false, example: 35 })
    @Expose()
    @Type(() => Number)
    criaWeight?: number;

    @ApiProperty({ description: 'Estado de la cría al nacer', enum: ['alive', 'dead'], example: 'alive' })
    @Expose()
    criaStatus: string;

    @ApiProperty({ description: 'Condición de la madre tras el parto', enum: ['good', 'regular', 'bad'], required: false, example: 'good' })
    @Expose()
    motherCondition?: string;

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();

    @ApiProperty({ description: 'Animal cría registrado (null si nació muerto)', type: RanchAnimalPlainDto, nullable: true })
    @Expose()
    @Type(() => RanchAnimalPlainDto)
    cria: RanchAnimalPlainDto = new RanchAnimalPlainDto();
}
