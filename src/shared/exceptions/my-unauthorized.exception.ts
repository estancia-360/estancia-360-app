import { HttpException, HttpStatus } from "@nestjs/common";

export class MyUnauthorizedException extends HttpException {
    constructor(message: string, errorCode: string = 'UNAUTHORIZED') {
        super({
            message,
            error: errorCode,
            statusCode: 401
        }, HttpStatus.UNAUTHORIZED);
    }
}