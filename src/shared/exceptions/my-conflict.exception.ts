import { HttpException, HttpStatus } from "@nestjs/common";

export class MyConflictException extends HttpException {
    constructor(message: string) {
        super({ message }, HttpStatus.CONFLICT);
    }
}