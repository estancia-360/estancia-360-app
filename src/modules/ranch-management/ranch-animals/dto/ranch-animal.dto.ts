import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AnimalBreedDto } from '../../animal-breeds/dto/animal-breed.dto';
import { AnimalStatusDto } from '../../animal-statuses/dto/animal-status.dto';
import { AnimalClassDto } from 'src/modules/core/animal-classes/dto/animal-class.dto';

export class RanchAnimalDto {

    @ApiProperty({ description: 'Identificador único del animal dentro de la estancia', example: 10 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del estado productivo del animal (1=Cría, 2=Recría, 3=Engorde, 4=Baja)', nullable: true })
    @Expose()
    @Type(() => Number)
    idProductiveStatus?: number;

    @ApiProperty({ description: 'ID del lote actual del animal', nullable: true })
    @Expose()
    @Type(() => Number)
    idLot?: number;

    @ApiProperty({ description: 'ID de la madre', nullable: true })
    @Expose()
    @Type(() => Number)
    idMother?: number;

    @ApiProperty({ description: 'ID del padre', nullable: true })
    @Expose()
    @Type(() => Number)
    idFather?: number;

    @ApiProperty({ description: 'Código o arete del animal', example: 'AR-000123' })
    @Expose()
    @Type(() => String)
    code: string;

    @ApiProperty({ description: 'Estado actual del animal', type: AnimalStatusDto })
    @Expose()
    @Type(() => AnimalStatusDto)
    status: AnimalStatusDto = new AnimalStatusDto();

    @ApiProperty({ description: 'Raza del animal', type: AnimalBreedDto })
    @Expose()
    @Type(() => AnimalBreedDto)
    breed: AnimalBreedDto = new AnimalBreedDto();

    @ApiProperty({ description: 'Clase del animal', type: AnimalClassDto })
    @Expose()
    @Type(() => AnimalClassDto)
    animalClass: AnimalClassDto = new AnimalClassDto();

    @ApiProperty({ description: 'Fecha de nacimiento del animal', example: '2023-05-10' })
    @Expose()
    birthdate: Date;

    @ApiProperty({ description: 'Peso del animal en kilogramos', example: 350.75, required: false })
    @Expose()
    weight?: number;

    @ApiProperty({ description: 'Sexo del animal (F = Hembra, M = Macho)', example: 'F' })
    @Expose()
    sex: 'F' | 'M';

    @ApiProperty({ description: 'Fecha de creación', type: Date })
    @Expose()
    createdAt: Date
}
