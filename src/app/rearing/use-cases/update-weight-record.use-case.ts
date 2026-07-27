import { Injectable } from '@nestjs/common';
import { UpdateWeightRecordDto } from '../dto/inputs/update-weight-record.dto';
import { WeightRecordsService } from 'src/modules/rearing-modules/weight-records/services/weight-records.service';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';

@Injectable()
export class UpdateWeightRecordUseCase {
    constructor(private readonly weightRecordsService: WeightRecordsService) {}

    async execute(id: number, dto: UpdateWeightRecordDto): Promise<WeightRecordDto> {
        await this.weightRecordsService.update(id, dto);
        return (await this.weightRecordsService.findOneById(WeightRecordDto, id, { throwException: true }))!;
    }
}
