import { HttpException, HttpStatus } from "@nestjs/common";

export class MyUnauthorizedException extends HttpException {
    constructor(message: string) {
        super({ message }, HttpStatus.UNAUTHORIZED);
    }
}