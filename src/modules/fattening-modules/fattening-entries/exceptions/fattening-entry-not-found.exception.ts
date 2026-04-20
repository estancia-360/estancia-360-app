import { MyNotFoundException } from 'src/shared/exceptions';

export class FatteningEntryNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El ingreso a engorde con ID = ${id} no fue encontrado.`, 'FATTENING_ENTRY_NOT_FOUND');
    }
}
