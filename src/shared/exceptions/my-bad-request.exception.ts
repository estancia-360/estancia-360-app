import { HttpException, HttpStatus } from "@nestjs/common";

export class MyBadRequestException extends HttpException {
    constructor(message: string, errorCode: string = 'BAD_REQUEST'){
        super({
            message: [message],
            error: errorCode,
            statusCode: 400
        }, HttpStatus.BAD_REQUEST)
    }
}