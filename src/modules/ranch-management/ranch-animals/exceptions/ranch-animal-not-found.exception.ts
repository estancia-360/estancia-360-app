import { MyNotFoundException } from "src/shared/exceptions";

export class RanchAnimalNotFoundException extends MyNotFoundException {
    constructor (id: number){
        super(`El animal con el Id = ${id} no fue encontrado.`)
    }
}