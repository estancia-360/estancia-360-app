import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class RanchAnimalPlainDto {
    @ApiProperty({
        description: 'Identificador único del animal dentro de la estancia',
        example: 10
    })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({
        description: 'ID de la estancia a la que pertenece el animal',
        example: 1
    })
    @Expose()
    @Type(() => Number)
    idRanch: number;

    @ApiProperty({
        description: 'Código o arete del animal',
        example: 'AR-000123'
    })
    @Expose()
    code: string;

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