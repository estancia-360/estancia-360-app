import { NotFoundException } from '@nestjs/common';

export class MovementAnimalNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Movement animal ID=${id} not found.`, error: 'MOVEMENT_ANIMAL_NOT_FOUND' });
    }
}
