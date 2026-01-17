import { MyUnauthorizedException } from "src/shared/exceptions";

export class IncorrectCredentialsException extends MyUnauthorizedException {
    constructor(){
        super('Credenciales incorrectas')
    }
}