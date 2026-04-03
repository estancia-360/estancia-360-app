import { MyNotFoundException } from 'src/shared/exceptions';

export class BreedingServiceNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El servicio de monta con ID = ${id} no fue encontrado.`, 'BREEDING_SERVICE_NOT_FOUND');
    }
}
