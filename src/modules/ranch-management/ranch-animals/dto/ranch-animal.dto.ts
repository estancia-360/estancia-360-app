import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AnimalBreedDto } from '../../animal-breeds/dto/animal-breed.dto';
import { AnimalStatusDto } from '../../animal-statuses/dto/animal-status.dto';

export class RanchAnimalDto {

    @ApiProperty({
        description: 'Identificador único del animal dentro de la estancia',
        example: 10
    })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({
        description: 'ID de la madre',
        example: 'AR-000123',
        nullable: true,
    })
    @Expose()
    @Type(() => Number)
    idMother?: number;

    @ApiProperty({
        description: 'ID del padre',
        example: 'AR-0001234',
        nullable: true,
    })
    @Expose()
    @Type(() => Number)
    idFather?: number;

    @ApiProperty({
        description: 'Código o arete del animal',
        example: 'AR-000123'
    })
    @Expose()
    @Type(() => String)
    code: string;

    @ApiProperty({
        description: 'Estado actual del animal',
        type: AnimalStatusDto
    })
    @Expose()
    @Type(() => AnimalStatusDto)
    status: AnimalStatusDto = new AnimalStatusDto();

    @ApiProperty({
        description: 'Raza del animal',
        type: AnimalBreedDto
    })
    @Expose()
    @Type(() => AnimalBreedDto)
    breed: AnimalBreedDto = new AnimalBreedDto();

    @ApiProperty({
        description: 'Fecha de nacimiento del animal',
        example: '2023-05-10'
    })
    @Expose()
    birthdate: Date;

    @ApiProperty({
        description: 'Peso del animal en kilogramos',
        example: 350.75,
        required: false
    })
    @Expose()
    weight?: number;

    @ApiProperty({
        description: 'Sexo del animal (F = Hembra, M = Macho)',
        example: 'F'
    })
    @Expose()
    sex: 'F' | 'M';

    @ApiProperty({
        description: 'Indica si el animal está castrado',
        example: false,
        required: false
    })
    @Expose()
    isCastrated?: boolean;

    @ApiProperty({
        description: 'Indica si el animal está esterilizado',
        example: false,
        required: false
    })
    @Expose()
    isSterilized?: boolean;

    @ApiProperty({
        description: 'Indica si la hembra ya ha parido al menos una vez',
        example: true,
        required: false
    })
    @Expose()
    hasCalved?: boolean;

    @ApiProperty({
        description: 'Fecha de creacion',
        type: Date
    })
    @Expose()
    createdAt: Date
}
