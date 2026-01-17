import { MyNotFoundException } from "src/shared/exceptions";

export class RoleNotFoundException extends MyNotFoundException {
    constructor(){
        super('Rol de usuario no encontrado')
    }
}