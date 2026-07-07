import { MyNotFoundException } from 'src/shared/exceptions';

export class AnimalExitNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`La baja de animal con ID = ${id} no fue encontrada.`, 'ANIMAL_EXIT_NOT_FOUND');
    }
}
