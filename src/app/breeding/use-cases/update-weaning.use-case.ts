import { Injectable } from '@nestjs/common';
import { UpdateWeaningDto } from '../dto/inputs/update-weaning.dto';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';

@Injectable()
export class UpdateWeaningUseCase {
    constructor(
        private readonly weaningsService: WeaningsService,
    ) {}

    /**
     * Actualiza los campos editables de un destete.
     * Lanza WeaningNotFoundException si no existe el registro.
     */
    async execute(id: number, dto: UpdateWeaningDto): Promise<WeaningDto> {
        await this.weaningsService.update(id, dto);
        return (await this.weaningsService.findOneById(
            id,
            { throwException: true, template: WeaningDto },
        ))!;
    }
}
