import { MyNotFoundException } from 'src/shared/exceptions';

export class RearingSelectionNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`La selección de recría con ID = ${id} no fue encontrada.`, 'REARING_SELECTION_NOT_FOUND');
    }
}
