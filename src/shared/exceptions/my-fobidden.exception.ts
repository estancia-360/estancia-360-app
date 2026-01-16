import { HttpException, HttpStatus } from "@nestjs/common";

export class MyForbiddenException extends HttpException {
    constructor(message: string) {
        super({ message }, HttpStatus.FORBIDDEN);
    }
}