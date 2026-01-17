import { MyUnauthorizedException } from "src/shared/exceptions";

export class InvalidTokenException extends MyUnauthorizedException {
    constructor(){
        super('Token invalido')
    }
}