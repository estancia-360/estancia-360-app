import { NotFoundException } from '@nestjs/common';

export class GestationDiagnosisNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Gestation diagnosis ID=${id} not found.`, error: 'GESTATION_DIAGNOSIS_NOT_FOUND' });
    }
}
