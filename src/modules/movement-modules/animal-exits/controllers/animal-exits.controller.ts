import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnimalExitsService } from '../services/animal-exits.service';
import { AnimalExitDto } from '../dto/animal-exit.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Animal Exits')
@ApiBearerAuth('access-token')
@Controller('animal-exits')
export class AnimalExitsController {
    constructor(
        private readonly animalExitsService: AnimalExitsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List exits of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of exits.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<AnimalExitDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.animalExitsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get an exit by ID' })
    @ApiOkResponse({ type: AnimalExitDto })
    @ApiNotFound({ code: 'ANIMAL_EXIT_NOT_FOUND', message: 'Animal exit not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ animalExit: AnimalExitDto }> {
        const animalExit = await this.animalExitsService.findOneById(AnimalExitDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, animalExit.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { animalExit };
    }
}
