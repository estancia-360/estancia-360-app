import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CityDto {
    @ApiProperty({
        description: "Identificador único de la ciudad o municipio",
        example: 15
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: "Nombre de la ciudad o municipio",
        example: "Santa Cruz de la Sierra"
    })
    @Expose()
    name: string;
}
