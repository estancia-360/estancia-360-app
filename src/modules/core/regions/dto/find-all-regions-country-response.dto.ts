import { ApiProperty } from "@nestjs/swagger";
import { RegionDto } from "./region.dto";

export class FindAllRegionsCountryResponseDto {
    @ApiProperty({
        description: 'Lista de Regiones del pais',
        type: [RegionDto]
    })
    regions: RegionDto[]
}