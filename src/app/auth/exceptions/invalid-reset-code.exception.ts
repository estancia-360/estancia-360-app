import { BadRequestException } from '@nestjs/common';

export class InvalidResetCodeException extends BadRequestException {
    constructor() {
        super({ message: 'Invalid or expired reset code.', error: 'INVALID_RESET_CODE' });
    }
}
