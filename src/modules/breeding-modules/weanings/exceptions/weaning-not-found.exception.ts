import { MyNotFoundException } from 'src/shared/exceptions';

export class WeaningNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El destete con ID = ${id} no fue encontrado.`, 'WEANING_NOT_FOUND');
    }
}
