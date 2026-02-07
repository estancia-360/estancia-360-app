import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnimalStatusDto {

    @ApiProperty({
        description: 'Identificador único del estado del animal',
        example: 1
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: 'Nombre del estado del animal',
        example: 'Activo'
    })
    @Expose()
    name: string;
}
