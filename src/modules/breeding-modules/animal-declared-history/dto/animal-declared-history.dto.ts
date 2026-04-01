import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class AnimalDeclaredHistoryDto {
    @ApiProperty({ description: 'ID del historial declarado', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del animal de estancia al que pertenece este historial', example: 10 })
    @Expose()
    @Type(() => Number)
    idRanchAnimal: number;

    @ApiProperty({ description: 'Cantidad de partos previos antes del ingreso al sistema', required: false, example: 3 })
    @Expose()
    prevBirthsCount?: number;

    @ApiProperty({ description: 'Año del último parto previo al ingreso al sistema', required: false, example: 2024 })
    @Expose()
    prevLastBirthYear?: number;

    @ApiProperty({ description: 'Promedio de peso al destete de crías previas (kg)', required: false, example: 115.50 })
    @Expose()
    prevAvgWeaningWeight?: number;

    @ApiProperty({ description: 'Observaciones adicionales del historial declarado', required: false, example: 'Animal comprado con historial verbal del vendedor' })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;
}
