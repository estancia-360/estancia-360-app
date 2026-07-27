import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AnimalStatusesService } from '../services/animal-statuses.service';
import { AnimalStatusDto } from '../dto/animal-status.dto';
import { UserUp } from 'src/app/auth/decorators';

// Ruta y forma de respuesta ("animal-states" / "statues") preservadas tal cual
// del viejo aunque tengan un typo — es lo que el móvil ya consume.
@ApiTags('Animal Statuses')
@ApiBearerAuth('access-token')
@Controller('animal-states')
export class AnimalStatusesController {
    constructor(private readonly animalStatusesService: AnimalStatusesService) {}

    @Get()
    @UserUp()
    @ApiOperation({ summary: 'Get all active animal statuses' })
    @ApiOkResponse({ type: [AnimalStatusDto] })
    async findAll(): Promise<{ statues: AnimalStatusDto[] }> {
        return { statues: await this.animalStatusesService.findAllActive() };
    }
}
