import { ApiProperty } from "@nestjs/swagger";
import { CityDto } from "./city.dto";

export class FindAllCitiesRegionResponseDto {
    @ApiProperty({
        description: 'Lista de ciudades de la region',
        type: [CityDto]
    })
    cities: CityDto[]
}