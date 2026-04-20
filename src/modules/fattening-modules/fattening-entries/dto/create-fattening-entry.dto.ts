import { SystemTypeEnum } from '../entities/fattening-entry.entity';

export class CreateFatteningEntryDto {
    idEvent: number;
    initialWeight?: number;
    systemType: SystemTypeEnum;
}
