import { RearingDestinationEnum } from '../entities/rearing-selection.entity';

export class CreateRearingSelectionDto {
    idEvent: number;
    localId?: string;
    idLotDest?: number;
    destination: RearingDestinationEnum;
    weightAtSelection?: number;
    bodyCondition?: number;
    geneticScore?: number;
}
