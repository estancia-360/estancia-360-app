import { ApiProperty } from "@nestjs/swagger";
import { CountryDto } from "./country.dto";

export class FindAllCountriesResponseDto {
    @ApiProperty({
        description: 'Lista de paises disponibles',
        type: [CountryDto]
    })
    countries: CountryDto[]
}