import { HttpException, HttpStatus } from "@nestjs/common";

export class MyForbiddenException extends HttpException {
    constructor(message: string, errorCode: string = 'FORBIDDEN') {
        super({
            message,
            error: errorCode,
            statusCode: 403
        }, HttpStatus.FORBIDDEN);
    }
}