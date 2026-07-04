export class CreateTreatmentDto {
    idEvent: number;
    illness?: string;
    medication: string;
    dose?: string;
    durationDays?: number;
    withdrawalDays?: number;
    withdrawalEndDate?: Date;
    responsible?: string;
    notes?: string;
}
