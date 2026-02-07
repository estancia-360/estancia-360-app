import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnimalBreedDto {

    @ApiProperty({
        description: 'Identificador único de la raza',
        example: 1
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: 'Nombre de la raza del animal',
        example: 'Nelore'
    })
    @Expose()
    name: string;
}
