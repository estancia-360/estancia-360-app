import { Injectable } from '@nestjs/common';
import { FatteningEntriesService } from 'src/modules/fattening-modules/fattening-entries/services/fattening-entries.service';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { UpdateFatteningEntryDto } from '../dto/inputs/update-fattening-entry.dto';

@Injectable()
export class UpdateFatteningEntryUseCase {
    constructor(private readonly fatteningEntriesService: FatteningEntriesService) {}

    async execute(id: number, dto: UpdateFatteningEntryDto): Promise<FatteningEntryDto> {
        await this.fatteningEntriesService.update(id, {
            systemType: dto.systemType,
            initialWeight: dto.initialWeight,
        });
        return (await this.fatteningEntriesService.findOneById(id, {
            throwException: true,
            template: FatteningEntryDto,
        }))!;
    }
}
