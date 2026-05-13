export class CreateFeedRecordDto {
    idLot: number;
    idUser?: number;
    localId?: string;
    feedDate: Date;
    feedType: string;
    quantity?: number;
    unit?: string;
    cost?: number;
    notes?: string;
    isSynced?: boolean;
}
