import { MyNotFoundException } from "src/shared/exceptions";

export class RanchAnimalNotFoundByCodeException extends MyNotFoundException {
    constructor(code: string){
        super(`El animal con el codigo = ${code} no fue encontrado.`, 'ANIMAL_NOT_FOUND')
    }
}