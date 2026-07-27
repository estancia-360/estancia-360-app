import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnimalDeclaredHistoryService } from '../services/animal-declared-history.service';
import { AnimalDeclaredHistoryDto } from '../dto/animal-declared-history.dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Animal Declared History')
@ApiBearerAuth('access-token')
@Controller('animal-declared-history')
export class AnimalDeclaredHistoryController {
    constructor(private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: "Get an animal's declared history by animal ID" })
    @ApiOkResponse({ type: AnimalDeclaredHistoryDto })
    @ApiNotFound({ code: 'ANIMAL_DECLARED_HISTORY_NOT_FOUND', message: 'Declared history not found.' })
    async findOneByAnimalId(@Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number): Promise<AnimalDeclaredHistoryDto> {
        return await this.animalDeclaredHistoryService.findOneByAnimalId(AnimalDeclaredHistoryDto, idRanchAnimal);
    }

    @Get(':idHistory')
    @UserUp()
    @ApiOperation({ summary: 'Get a declared history by its own ID' })
    @ApiOkResponse({ type: AnimalDeclaredHistoryDto })
    @ApiNotFound({ code: 'ANIMAL_DECLARED_HISTORY_NOT_FOUND', message: 'Declared history not found.' })
    async findOneById(@Param('idHistory', ParseIntPipe) idHistory: number): Promise<AnimalDeclaredHistoryDto> {
        return await this.animalDeclaredHistoryService.findOneById(AnimalDeclaredHistoryDto, idHistory);
    }
}
