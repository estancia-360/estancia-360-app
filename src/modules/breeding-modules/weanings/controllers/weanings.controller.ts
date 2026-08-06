import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WeaningsService } from '../services/weanings.service';
import { WeaningDto } from '../dto/weaning.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

// Ruta "breeding/weanings" (no solo "weanings") — así estaba en el viejo y es lo
// que el móvil ya consume. Las mutaciones (POST/PATCH/DELETE) viven en
// app/breeding, acá solo lecturas.
@ApiTags('Weanings')
@ApiBearerAuth('access-token')
@Controller('breeding/weanings')
export class WeaningsController {
    constructor(
        private readonly weaningsService: WeaningsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List weanings of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of weanings.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<WeaningDto>> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return await this.weaningsService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List weanings of an animal (as calf), paginated' })
    @ApiOkResponse({ description: 'Paginated list of weanings.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<WeaningDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.weaningsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idWeaning')
    @UserUp()
    @ApiOperation({ summary: 'Get a weaning by ID' })
    @ApiOkResponse({ type: WeaningDto })
    @ApiNotFound({ code: 'WEANING_NOT_FOUND', message: 'Weaning not found.' })
    async findOneById(@Param('idWeaning', ParseIntPipe) idWeaning: number, @CurrentUser('id') idUser: number): Promise<{ weaning: WeaningDto }> {
        const weaning = await this.weaningsService.findOneById(WeaningDto, idWeaning);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, weaning.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { weaning };
    }
}
