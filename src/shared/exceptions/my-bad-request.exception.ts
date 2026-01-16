import { HttpException, HttpStatus } from "@nestjs/common";

export class MyBadRequestException extends HttpException {
    constructor(message: string){
        super({
            message: [message],
            error: 'BAD_REQUEST',
            statusCode: 400
        },HttpStatus.BAD_REQUEST)
    }
}