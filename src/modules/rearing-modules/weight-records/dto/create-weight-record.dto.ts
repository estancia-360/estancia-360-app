import { WeightTypeEnum } from '../entities/weight-record.entity';

export class CreateWeightRecordDto {
    idEvent: number;
    idLot: number;
    localId?: string;
    weight: number;
    weightType: WeightTypeEnum;
    bodyCondition?: number;
    ageDays?: number;
    notes?: string;
}
