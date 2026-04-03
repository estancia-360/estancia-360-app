import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class AnimalClassDto {
    @ApiProperty({ description: 'ID de la clase de animal', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'Nombre de la clase', example: 'Vaca' })
    @Expose()
    name: string;

    @ApiProperty({ description: 'Sexo asociado a esta clase', enum: ['F', 'M'], example: 'F' })
    @Expose()
    sex: 'F' | 'M';

    @ApiProperty({ description: 'Indica si la clase está activa', example: true })
    @Expose()
    isActive: boolean;
}
