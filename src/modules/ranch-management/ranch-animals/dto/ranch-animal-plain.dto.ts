import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class RanchAnimalPlainDto {
    @ApiProperty({ description: 'Identificador único del animal dentro de la estancia', example: 10 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID de la estancia a la que pertenece el animal', example: 1 })
    @Expose()
    @Type(() => Number)
    idRanch: number;

    @ApiProperty({ description: 'ID del estado productivo del animal (1=Cría, 2=Recría, 3=Engorde, 4=Baja)', nullable: true })
    @Expose()
    @Type(() => Number)
    idProductiveStatus?: number;

    @ApiProperty({ description: 'ID de la clase del animal', example: 1 })
    @Expose()
    @Type(() => Number)
    idAnimalClass: number;

    @ApiProperty({ description: 'Código o arete del animal', example: 'AR-000123' })
    @Expose()
    code: string;

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