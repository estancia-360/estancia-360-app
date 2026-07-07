import { MyNotFoundException } from 'src/shared/exceptions';

export class MovementNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El movimiento con ID = ${id} no fue encontrado.`, 'MOVEMENT_NOT_FOUND');
    }
}
