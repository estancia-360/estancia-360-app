import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParturitionsService } from '../services/parturitions.service';
import { ParturitionDto } from '../dto/parturition.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Parturitions')
@ApiBearerAuth('access-token')
@Controller('parturitions')
export class ParturitionsController {
    constructor(
        private readonly parturitionsService: ParturitionsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List parturitions of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of parturitions.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<ParturitionDto>> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return await this.parturitionsService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List parturitions of an animal (as mother), paginated' })
    @ApiOkResponse({ description: 'Paginated list of parturitions.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<ParturitionDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.parturitionsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idParturition')
    @UserUp()
    @ApiOperation({ summary: 'Get a parturition by ID' })
    @ApiOkResponse({ type: ParturitionDto })
    @ApiNotFound({ code: 'PARTURITION_NOT_FOUND', message: 'Parturition not found.' })
    async findOneById(
        @Param('idParturition', ParseIntPipe) idParturition: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ parturition: ParturitionDto }> {
        const parturition = await this.parturitionsService.findOneById(ParturitionDto, idParturition);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, parturition.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { parturition };
    }
}
