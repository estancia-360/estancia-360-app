import { MyNotFoundException } from 'src/shared/exceptions';

export class MovementAnimalNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El detalle de animal en movimiento con ID = ${id} no fue encontrado.`, 'MOVEMENT_ANIMAL_NOT_FOUND');
    }
}
