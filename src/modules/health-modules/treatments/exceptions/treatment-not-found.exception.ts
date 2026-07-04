import { MyNotFoundException } from 'src/shared/exceptions';

export class TreatmentNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El tratamiento con ID = ${id} no fue encontrado.`, 'TREATMENT_NOT_FOUND');
    }
}
