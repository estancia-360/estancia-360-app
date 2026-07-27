import { Injectable } from '@nestjs/common';
import { UpdateWeaningDto } from '../dto/inputs/update-weaning.dto';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';

@Injectable()
export class UpdateWeaningUseCase {
    constructor(private readonly weaningsService: WeaningsService) {}

    async execute(id: number, dto: UpdateWeaningDto): Promise<WeaningDto> {
        // dto.ageDays → weaningAge: el viejo tenía este mismatch de nombres y el
        // valor nunca se aplicaba. Se corrige acá sin cambiar el campo que espera
        // el cliente (sigue siendo "ageDays" en el body).
        await this.weaningsService.update(id, { weaningWeight: dto.weaningWeight, weaningAge: dto.ageDays });
        return (await this.weaningsService.findOneById(WeaningDto, id, { throwException: true }))!;
    }
}
