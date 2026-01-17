import { MyNotFoundException } from "src/shared/exceptions";

export class UserNotFoundByIdException extends MyNotFoundException {
    constructor(id: number){
        super(`El usuario con el ID = ${id} no fue encontrado.`)
    }
}

export class UserNotFoundByEmailException extends MyNotFoundException {
    constructor(email: string){
        super(`El usuario con el email de ${email} no fue encontrado.`)
    }
}