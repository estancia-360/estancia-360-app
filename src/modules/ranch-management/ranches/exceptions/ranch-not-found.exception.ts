import { NotFoundException } from '@nestjs/common';

export class RanchNotFoundException extends NotFoundException {
    constructor() {
        super({ message: 'Ranch not found.', error: 'RANCH_NOT_FOUND' });
    }
}
