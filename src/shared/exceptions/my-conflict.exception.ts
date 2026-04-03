import { HttpException, HttpStatus } from "@nestjs/common";

export class MyConflictException extends HttpException {
    constructor(message: string, errorCode: string = 'CONFLICT') {
        super({
            message,
            error: errorCode,
            statusCode: 409
        }, HttpStatus.CONFLICT);
    }
}