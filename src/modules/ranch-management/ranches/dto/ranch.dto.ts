import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CityDto } from "src/modules/core/cities/dto/city.dto";
import { ProductionTypeDto } from "src/modules/core/production-types/dto/production-type.dto";

/**
 * DTO intermedio para la tabla de unión ranch_production_types.
 * Refleja la relación Ranch → RanchProductionType → ProductionType.
 */
export class RanchProductionTypeDto {
    @ApiProperty({ description: "ID del tipo de producción", example: 1 })
    @Expose()
    idProductionType: number;

    @ApiProperty({ description: "Tipo de producción", type: ProductionTypeDto })
    @Expose()
    @Type(() => ProductionTypeDto)
    productionType: ProductionTypeDto = new ProductionTypeDto();
}

export class RanchDto {
    @ApiProperty({
        description: "Identificador único de la estancia ganadera",
        example: 1
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: "Nombre de la estancia ganadera",
        example: "Estancia San Pedro"
    })
    @Expose()
    name: string;

    @ApiProperty({
        description: "Ciudad o municipio donde se ubica la estancia",
        type: CityDto
    })
    @Expose()
    @Type(() => CityDto)
    city: CityDto = new CityDto();

    @ApiProperty({
        description: "Tipos de producción de la estancia ganadera",
        type: [RanchProductionTypeDto]
    })
    @Expose()
    @Type(() => RanchProductionTypeDto)
    productionTypes: RanchProductionTypeDto[] = [new RanchProductionTypeDto()];

    @ApiProperty({
        description: "Fecha de creación del registro de la estancia",
        example: "2026-01-20T14:30:00.000Z"
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: "Fecha de la última actualización del registro",
        example: "2026-01-22T10:15:00.000Z"
    })
    @Expose()
    updatedAt: Date;
}
