import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WeaningsService } from '../services/weanings.service';
import { WeaningDto } from '../dto/weaning.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

// Ruta "breeding/weanings" (no solo "weanings") — así estaba en el viejo y es lo
// que el móvil ya consume. Las mutaciones (POST/PATCH/DELETE) viven en
// app/breeding, acá solo lecturas.
@ApiTags('Weanings')
@ApiBearerAuth('access-token')
@Controller('breeding/weanings')
export class WeaningsController {
    constructor(private readonly weaningsService: WeaningsService) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List weanings of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of weanings.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<WeaningDto>> {
        return await this.weaningsService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List weanings of an animal (as calf), paginated' })
    @ApiOkResponse({ description: 'Paginated list of weanings.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<WeaningDto>> {
        return await this.weaningsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idWeaning')
    @UserUp()
    @ApiOperation({ summary: 'Get a weaning by ID' })
    @ApiOkResponse({ type: WeaningDto })
    @ApiNotFound({ code: 'WEANING_NOT_FOUND', message: 'Weaning not found.' })
    async findOneById(@Param('idWeaning', ParseIntPipe) idWeaning: number): Promise<{ weaning: WeaningDto }> {
        return { weaning: await this.weaningsService.findOneById(WeaningDto, idWeaning) };
    }
}
