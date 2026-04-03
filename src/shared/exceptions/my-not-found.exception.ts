import { HttpException, HttpStatus } from "@nestjs/common";

export class MyNotFoundException extends HttpException {
    constructor(message: string, errorCode: string = 'NOT_FOUND'){
        super({
            message,
            error: errorCode,
            statusCode: 404
        }, HttpStatus.NOT_FOUND);
    }
}