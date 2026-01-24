import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class RegionDto {
    @ApiProperty({
        description: "Identificador único de la región",
        example: 7
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: "Nombre de la región",
        example: "Bolivia"
    })
    @Expose()
    name: string;
}
