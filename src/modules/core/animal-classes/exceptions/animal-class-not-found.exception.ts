import { MyNotFoundException } from 'src/shared/exceptions';

export class AnimalClassNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`La clase de animal con ID = ${id} no fue encontrada.`, 'ANIMAL_CLASS_NOT_FOUND');
    }
}
