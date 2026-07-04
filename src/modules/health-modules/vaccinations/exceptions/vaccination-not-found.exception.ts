import { MyNotFoundException } from 'src/shared/exceptions';

export class VaccinationNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`La vacunación con ID = ${id} no fue encontrada.`, 'VACCINATION_NOT_FOUND');
    }
}
