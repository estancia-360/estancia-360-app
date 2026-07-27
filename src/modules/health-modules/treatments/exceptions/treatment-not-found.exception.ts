import { NotFoundException } from '@nestjs/common';

export class TreatmentNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Treatment ID=${id} not found.`, error: 'TREATMENT_NOT_FOUND' });
    }
}
