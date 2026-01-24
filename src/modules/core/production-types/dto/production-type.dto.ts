import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ProductionTypeDto {
    @ApiProperty({
        description: "Identificador único del tipo de producción ganadera",
        example: 3
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: "Nombre del tipo de producción ganadera",
        example: "Producción Lechera"
    })
    @Expose()
    name: string;
}
