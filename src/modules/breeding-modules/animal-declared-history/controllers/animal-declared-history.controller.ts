import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnimalDeclaredHistoryService } from '../services/animal-declared-history.service';
import { AnimalDeclaredHistoryDto } from '../dto/animal-declared-history.dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Animal Declared History')
@ApiBearerAuth('access-token')
@Controller('animal-declared-history')
export class AnimalDeclaredHistoryController {
    constructor(
        private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: "Get an animal's declared history by animal ID" })
    @ApiOkResponse({ type: AnimalDeclaredHistoryDto })
    @ApiNotFound({ code: 'ANIMAL_DECLARED_HISTORY_NOT_FOUND', message: 'Declared history not found.' })
    async findOneByAnimalId(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ history: AnimalDeclaredHistoryDto }> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { history: await this.animalDeclaredHistoryService.findOneByAnimalId(AnimalDeclaredHistoryDto, idRanchAnimal) };
    }

    @Get(':idHistory')
    @UserUp()
    @ApiOperation({ summary: 'Get a declared history by its own ID' })
    @ApiOkResponse({ type: AnimalDeclaredHistoryDto })
    @ApiNotFound({ code: 'ANIMAL_DECLARED_HISTORY_NOT_FOUND', message: 'Declared history not found.' })
    async findOneById(@Param('idHistory', ParseIntPipe) idHistory: number, @CurrentUser('id') idUser: number): Promise<{ history: AnimalDeclaredHistoryDto }> {
        const history = await this.animalDeclaredHistoryService.findOneById(AnimalDeclaredHistoryDto, idHistory);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, history.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { history };
    }
}
