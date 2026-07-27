import { NotFoundException } from '@nestjs/common';

export class MovementNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Movement ID=${id} not found.`, error: 'MOVEMENT_NOT_FOUND' });
    }
}
