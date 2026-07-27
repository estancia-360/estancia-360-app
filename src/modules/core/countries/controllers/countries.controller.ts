import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CountriesService } from '../services/countries.service';
import { CountryDto } from '../dto/country.dto';
import { Public } from 'src/app/auth/decorators';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    // Catálogo público — el form de creación de estancia lo necesita antes de que
    // el usuario tenga sesión activa en algunos flujos. Igual que el viejo.
    @Get()
    @Public()
    @ApiOperation({ summary: 'List active countries' })
    @ApiOkResponse({ schema: { example: { countries: [{ id: 5, name: 'Bolivia' }] } } })
    async findAll(): Promise<{ countries: CountryDto[] }> {
        return { countries: await this.countriesService.findAll(CountryDto) };
    }
}
