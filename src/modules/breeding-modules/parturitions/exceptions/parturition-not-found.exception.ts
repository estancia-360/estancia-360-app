import { MyNotFoundException } from 'src/shared/exceptions';

export class ParturitionNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El parto con ID = ${id} no fue encontrado.`);
    }
}
