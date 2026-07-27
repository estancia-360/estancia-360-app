import { NotFoundException } from '@nestjs/common';

export class RanchAnimalNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Animal ID=${id} not found.`, error: 'ANIMAL_NOT_FOUND' });
    }
}
