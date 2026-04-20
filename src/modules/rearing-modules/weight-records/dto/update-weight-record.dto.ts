import { WeightTypeEnum } from '../entities/weight-record.entity';

export class UpdateWeightRecordDto {
    weight?: number;
    weightType?: WeightTypeEnum;
    bodyCondition?: number;
    ageDays?: number;
    notes?: string;
}
