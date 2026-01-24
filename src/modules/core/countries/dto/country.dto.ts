import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CountryDto {
    @ApiProperty({
        description: "Identificador único del país",
        example: 5
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: "Nombre del país",
        example: "Bolivia"
    })
    @Expose()
    name: string;
}
