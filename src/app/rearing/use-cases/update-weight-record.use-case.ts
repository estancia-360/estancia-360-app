import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateWeightRecordDto } from '../dto/inputs/update-weight-record.dto';
import { WeightRecordsService } from 'src/modules/rearing-modules/weight-records/services/weight-records.service';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';

@Injectable()
export class UpdateWeightRecordUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly weightRecordsService: WeightRecordsService,
    ) {}

    async execute(id: number, dto: UpdateWeightRecordDto): Promise<WeightRecordDto> {
        return await this.dataSource.transaction(async (manager) => {
            await this.weightRecordsService.update(id, dto, manager);

            return (await this.weightRecordsService.findOneById(
                id,
                { throwException: true, template: WeightRecordDto },
                manager,
            ))!;
        });
    }
}
