import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateRearingSelectionDto } from '../dto/inputs/update-rearing-selection.dto';
import { RearingSelectionsService } from 'src/modules/rearing-modules/rearing-selections/services/rearing-selections.service';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';

@Injectable()
export class UpdateRearingSelectionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly rearingSelectionsService: RearingSelectionsService,
    ) {}

    async execute(id: number, dto: UpdateRearingSelectionDto): Promise<RearingSelectionDto> {
        return await this.dataSource.transaction(async (manager) => {
            await this.rearingSelectionsService.update(id, dto, manager);

            return (await this.rearingSelectionsService.findOneById(
                id,
                { throwException: true, template: RearingSelectionDto },
                manager,
            ))!;
        });
    }
}
